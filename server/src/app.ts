import cors from 'cors';
import express, { Request, Response } from 'express';
import {
  ConsumptionInput,
  ConsumptionType,
  getConsumptionByClientId,
  insertConsumption,
  insertConsumptions,
  listConsumptions,
} from './db';

const validTypes: ConsumptionType[] = ['beer', 'cigarette', 'water', 'coffee'];

function isConsumptionInput(value: unknown): value is ConsumptionInput {
  if (!value || typeof value !== 'object') return false;

  const input = value as Partial<ConsumptionInput>;
  return Boolean(
    typeof input.clientId === 'string' &&
    input.clientId.trim() &&
    typeof input.type === 'string' &&
    validTypes.includes(input.type as ConsumptionType) &&
    Number.isInteger(input.quantity) &&
    Number(input.quantity) > 0 &&
    typeof input.occurredAt === 'string' &&
    !Number.isNaN(Date.parse(input.occurredAt)),
  );
}

function sendValidationError(response: Response): void {
  response.status(400).json({ error: 'Invalid consumption payload' });
}

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/v1/consumptions', async (request, response, next) => {
  try {
    const from = typeof request.query.from === 'string' ? request.query.from : undefined;
    const to = typeof request.query.to === 'string' ? request.query.to : undefined;
    response.json({ data: await listConsumptions(from, to) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/consumptions/:clientId', async (request, response, next) => {
  try {
    const consumption = await getConsumptionByClientId(request.params.clientId);
    if (!consumption) {
      response.status(404).json({ error: 'Consumption not found' });
      return;
    }

    response.json({ data: consumption });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/consumptions', async (request, response, next) => {
  if (!isConsumptionInput(request.body)) {
    sendValidationError(response);
    return;
  }

  try {
    response.status(201).json({ data: await insertConsumption(request.body) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/sync', async (request, response, next) => {
  const items = request.body?.consumptions;
  if (!Array.isArray(items) || items.length > 500 || !items.every(isConsumptionInput)) {
    response.status(400).json({ error: 'Invalid sync payload' });
    return;
  }

  try {
    const data = await insertConsumptions(items);
    response.json({ data, syncedAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: Request, response: Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
});