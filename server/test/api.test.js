const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

describe("consumption API", () => {
  let app;
  let server;
  let baseUrl;
  let temporaryDirectory;
  let closeDatabase;

  before(async () => {
    temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "habit-pop-test-"));
    process.env.DATABASE_PATH = path.join(temporaryDirectory, "test.sqlite");

    ({ app } = require("../dist/app"));
    ({ closeDatabase } = require("../dist/db"));
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    if (closeDatabase) await closeDatabase();
    if (temporaryDirectory) {
      await fs.rm(temporaryDirectory, { recursive: true, force: true });
    }
    delete process.env.DATABASE_PATH;
  });

  async function request(route, options) {
    return fetch(`${baseUrl}${route}`, options);
  }

  function payload(clientId, overrides = {}) {
    return {
      clientId,
      type: "water",
      quantity: 1,
      occurredAt: "2026-09-08T12:00:00.000Z",
      ...overrides,
    };
  }

  it("reports the API health", async () => {
    const response = await request("/health");

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  });

  it("creates records idempotently and looks them up by client id", async () => {
    const original = payload("single-record", { quantity: 2 });
    const createResponse = await request("/api/v1/consumptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(original),
    });
    const created = (await createResponse.json()).data;

    assert.equal(createResponse.status, 201);
    assert.equal(created.clientId, original.clientId);
    assert.equal(created.quantity, 2);

    const retryResponse = await request("/api/v1/consumptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload("single-record", { quantity: 9 })),
    });
    const retried = (await retryResponse.json()).data;

    assert.equal(retryResponse.status, 201);
    assert.equal(retried.id, created.id);
    assert.equal(retried.quantity, 2);

    const lookup = await request("/api/v1/consumptions/single-record");
    assert.equal(lookup.status, 200);
    assert.equal((await lookup.json()).data.id, created.id);
  });

  it("rejects invalid records and oversized sync batches", async () => {
    const invalidRecords = [
      payload("", {}),
      payload("bad-type", { type: "juice" }),
      payload("zero-quantity", { quantity: 0 }),
      payload("fractional-quantity", { quantity: 1.5 }),
      payload("bad-date", { occurredAt: "not-a-date" }),
    ];

    for (const record of invalidRecords) {
      const response = await request("/api/v1/consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      assert.equal(response.status, 400);
    }

    const oversizedBatch = await request("/api/v1/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consumptions: Array.from({ length: 501 }, (_, index) =>
          payload(`oversized-${index}`),
        ),
      }),
    });
    assert.equal(oversizedBatch.status, 400);
  });

  it("syncs a batch idempotently", async () => {
    const consumptions = [
      payload("batch-one", { type: "coffee" }),
      payload("batch-two", { type: "beer", quantity: 2 }),
    ];
    const sendBatch = () =>
      request("/api/v1/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consumptions }),
      });

    const firstResponse = await sendBatch();
    const first = await firstResponse.json();
    const retryResponse = await sendBatch();
    const retry = await retryResponse.json();

    assert.equal(firstResponse.status, 200);
    assert.equal(retryResponse.status, 200);
    assert.deepEqual(
      retry.data.map((item) => item.id),
      first.data.map((item) => item.id),
    );
    assert.ok(first.syncedAt);
  });

  it("filters records by inclusive date bounds", async () => {
    const records = [
      payload("filter-before", { occurredAt: "2026-09-09T23:59:59.000Z" }),
      payload("filter-from", { occurredAt: "2026-09-10T00:00:00.000Z" }),
      payload("filter-to", { occurredAt: "2026-09-11T00:00:00.000Z" }),
      payload("filter-after", { occurredAt: "2026-09-11T00:00:01.000Z" }),
    ];

    for (const record of records) {
      await request("/api/v1/consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
    }

    const response = await request(
      "/api/v1/consumptions?from=2026-09-10T00%3A00%3A00.000Z&to=2026-09-11T00%3A00%3A00.000Z",
    );
    const data = (await response.json()).data;

    assert.deepEqual(
      data.map((item) => item.clientId),
      ["filter-to", "filter-from"],
    );
  });

  it("deletes records idempotently and returns 404 for missing lookups", async () => {
    const deletion = await request("/api/v1/consumptions/single-record", {
      method: "DELETE",
    });
    const repeatedDeletion = await request("/api/v1/consumptions/single-record", {
      method: "DELETE",
    });
    const lookup = await request("/api/v1/consumptions/single-record");

    assert.equal(deletion.status, 204);
    assert.equal(repeatedDeletion.status, 204);
    assert.equal(lookup.status, 404);
  });
});