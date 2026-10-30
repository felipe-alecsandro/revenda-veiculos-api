/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Catalog sync (e2e)', () => {
  let app: INestApplication;
  let vehicleId = '';
  const syncCalls: Array<{ url: string; method: string; token: string }> = [];
  let syncStatus = 200;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_SQLITE_PATH = ':memory:';
    process.env.SALES_API_BASE_URL = 'http://sales.test/v1';
    process.env.SALES_INTERNAL_TOKEN = 'test-internal-token';

    jest.spyOn(global, 'fetch').mockImplementation((input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const method = init?.method ?? 'GET';
      const headers = new Headers(init?.headers);
      syncCalls.push({
        url,
        method,
        token: headers.get('x-internal-token') ?? '',
      });
      return Promise.resolve(new Response('sync', { status: syncStatus }));
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it('rolls back the catalog when the sales service rejects the sync', async () => {
    syncStatus = 500;
    const server = app.getHttpServer();

    await request(server)
      .post('/v1/vehicles')
      .send({
        brand: 'Fiat',
        model: 'Mobi',
        year: 2022,
        color: 'Branco',
        price: 55000,
      })
      .expect(502);

    expect(syncCalls.at(-1)?.method).toBe('PUT');
  });

  it('creates and updates a vehicle and syncs both writes', async () => {
    syncStatus = 200;
    syncCalls.length = 0;
    const server = app.getHttpServer();

    const created = await request(server)
      .post('/v1/vehicles')
      .send({
        brand: 'Fiat',
        model: 'Mobi',
        year: 2022,
        color: 'Branco',
        price: 55000,
      })
      .expect(201);

    vehicleId = created.body.id;
    expect(syncCalls[0]).toEqual({
      url: `http://sales.test/v1/integration/vehicles/${vehicleId}`,
      method: 'PUT',
      token: 'test-internal-token',
    });

    const updated = await request(server)
      .patch(`/v1/vehicles/${vehicleId}`)
      .send({ color: 'Vermelho', price: 53000 })
      .expect(200);

    expect(updated.body.color).toBe('Vermelho');
    expect(Number(updated.body.price)).toBe(53000);
    expect(syncCalls[1]?.method).toBe('PUT');

    const loaded = await request(server)
      .get(`/v1/vehicles/${vehicleId}`)
      .expect(200);
    expect(loaded.body.color).toBe('Vermelho');
  });

  it('restores the previous catalog data when an update sync fails', async () => {
    syncStatus = 502;
    const server = app.getHttpServer();

    await request(server)
      .patch(`/v1/vehicles/${vehicleId}`)
      .send({ color: 'Preto' })
      .expect(502);

    syncStatus = 200;
    const loaded = await request(server)
      .get(`/v1/vehicles/${vehicleId}`)
      .expect(200);
    expect(loaded.body.color).toBe('Vermelho');
  });

  it('does not delete locally when the sales service refuses the removal', async () => {
    syncStatus = 409;
    const server = app.getHttpServer();

    await request(server).delete(`/v1/vehicles/${vehicleId}`).expect(409);
    await request(server).get(`/v1/vehicles/${vehicleId}`).expect(200);
  });

  it('deletes the vehicle after the sales service accepts it', async () => {
    syncStatus = 200;
    const server = app.getHttpServer();

    await request(server).delete(`/v1/vehicles/${vehicleId}`).expect(204);
    expect(syncCalls.at(-1)).toMatchObject({
      url: `http://sales.test/v1/integration/vehicles/${vehicleId}`,
      method: 'DELETE',
    });
    await request(server).get(`/v1/vehicles/${vehicleId}`).expect(404);
  });
});
