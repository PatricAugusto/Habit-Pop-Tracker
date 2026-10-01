const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const test = require("node:test");
const babel = require("@babel/core");
const transformModules = require("@babel/plugin-transform-modules-commonjs");

function loadModule(relativePath, overrides = {}) {
  const filename = path.resolve(__dirname, relativePath);
  const transformed = babel.transformFileSync(filename, {
    babelrc: false,
    configFile: false,
    plugins: [transformModules],
  });
  const loadedModule = new Module(filename, module);
  loadedModule.filename = filename;
  loadedModule.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loadedModule.require.bind(loadedModule);
  loadedModule.require = (request) =>
    Object.hasOwn(overrides, request) ? overrides[request] : originalRequire(request);
  loadedModule._compile(transformed.code, filename);
  return loadedModule.exports;
}

const {
  createConsumption,
  formatTime,
  getPendingItems,
  getTodayItems,
  getTotals,
} = loadModule("../src/domain/consumptions.js");
const syncService = loadModule("../src/services/syncConsumptions.js", {
  "../config/appConfig": { API_URL: "http://api.test" },
});

test("createConsumption returns a pending record with a unique client id", () => {
  const consumption = createConsumption("water", 2);

  assert.match(consumption.clientId, /^mobile-\d+-[a-f\d]+$/);
  assert.equal(consumption.type, "water");
  assert.equal(consumption.quantity, 2);
  assert.equal(consumption.pendingSync, true);
  assert.equal(Number.isNaN(Date.parse(consumption.occurredAt)), false);
});

test("getTodayItems only returns records from the supplied local day", () => {
  const today = new Date(2026, 8, 9, 12);
  const items = [
    { clientId: "today", occurredAt: new Date(2026, 8, 9, 8).toISOString() },
    { clientId: "yesterday", occurredAt: new Date(2026, 8, 8, 23).toISOString() },
  ];

  assert.deepEqual(getTodayItems(items, today), [items[0]]);
});

test("getTotals sums each consumption type and handles an empty day", () => {
  assert.deepEqual(getTotals([]), {
    beer: 0,
    cigarette: 0,
    water: 0,
    coffee: 0,
  });
  assert.deepEqual(
    getTotals([
      { type: "beer", quantity: 2 },
      { type: "beer", quantity: 1 },
      { type: "cigarette", quantity: 3 },
      { type: "water", quantity: 4 },
      { type: "coffee", quantity: 5 },
    ]),
    { beer: 3, cigarette: 3, water: 4, coffee: 5 },
  );
});

test("getPendingItems excludes records already synchronized", () => {
  const items = [
    { clientId: "pending", pendingSync: true },
    { clientId: "synced", pendingSync: false },
  ];

  assert.deepEqual(getPendingItems(items), [items[0]]);
});

test("formatTime returns a two-digit hour and minute", () => {
  assert.match(formatTime("2026-09-09T12:05:00.000Z"), /^\d{2}:\d{2}$/);
});

test("syncConsumptions posts the batch and returns the API response", async () => {
  const originalFetch = global.fetch;
  let requestUrl;
  let requestOptions;
  global.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return { ok: true, json: async () => ({ data: [] }) };
  };

  try {
    const consumptions = [{ clientId: "mobile-1", type: "water", quantity: 1 }];
    const result = await syncService.syncConsumptions(consumptions);

    assert.equal(requestUrl, "http://api.test/api/v1/sync");
    assert.equal(requestOptions.method, "POST");
    assert.deepEqual(JSON.parse(requestOptions.body), { consumptions });
    assert.deepEqual(result, { data: [] });
  } finally {
    global.fetch = originalFetch;
  }
});

test("syncConsumptions rejects unsuccessful API responses", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false });

  try {
    await assert.rejects(syncService.syncConsumptions([]), {
      message: "sync failed",
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test("deleteConsumption encodes ids and accepts an already-missing record", async () => {
  const originalFetch = global.fetch;
  let requestUrl;
  let requestOptions;
  global.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return { ok: false, status: 404 };
  };

  try {
    await syncService.deleteConsumption("id/with spaces");

    assert.equal(
      requestUrl,
      "http://api.test/api/v1/consumptions/id%2Fwith%20spaces",
    );
    assert.equal(requestOptions.method, "DELETE");
  } finally {
    global.fetch = originalFetch;
  }
});

test("deleteConsumption rejects server errors", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 500 });

  try {
    await assert.rejects(syncService.deleteConsumption("mobile-1"), {
      message: "delete failed",
    });
  } finally {
    global.fetch = originalFetch;
  }
});