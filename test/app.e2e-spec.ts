/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Business flow (e2e)', () => {
  let app: INestApplication;
  let firstVehicleId = '';
  let secondVehicleId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_SQLITE_PATH = ':memory:';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create vehicles and keep available list ordered by price', async () => {
    const server = app.getHttpServer();

    const firstCreate = await request(server)
      .post('/v1/vehicles')
      .send({
        brand: 'Fiat',
        model: 'Mobi',
        year: 2022,
        color: 'Branco',
        price: 55000,
      })
      .expect(201);

    firstVehicleId = firstCreate.body.id;

    const secondCreate = await request(server)
      .post('/v1/vehicles')
      .send({
        brand: 'Honda',
        model: 'City',
        year: 2023,
        color: 'Preto',
        price: 98000,
      })
      .expect(201);

    secondVehicleId = secondCreate.body.id;

    const availableList = await request(server).get('/v1/vehicles').expect(200);
    expect(availableList.body).toHaveLength(2);
    expect(Number(availableList.body[0].price)).toBeLessThan(
      Number(availableList.body[1].price),
    );
  });

  it('should update vehicle data', async () => {
    const server = app.getHttpServer();
    const updatedVehicle = await request(server)
      .patch(`/v1/vehicles/${firstVehicleId}`)
      .send({ color: 'Vermelho', price: 53000 })
      .expect(200);

    expect(updatedVehicle.body.color).toBe('Vermelho');
    expect(Number(updatedVehicle.body.price)).toBe(53000);
  });

  it('should purchase vehicle and list sold ordered by price', async () => {
    const server = app.getHttpServer();

    const purchaseResponse = await request(server)
      .post('/v1/sales')
      .set('Authorization', 'Bearer test-token')
      .send({ vehicleId: firstVehicleId })
      .expect(201);

    expect(purchaseResponse.body.vehicleId).toBe(firstVehicleId);

    await request(server)
      .post('/v1/sales')
      .set('Authorization', 'Bearer test-token')
      .send({ vehicleId: secondVehicleId })
      .expect(201);

    const soldList = await request(server).get('/v1/vehicles/sold').expect(200);
    expect(soldList.body).toHaveLength(2);
    expect(Number(soldList.body[0].price)).toBeLessThan(
      Number(soldList.body[1].price),
    );
  });

  it('should return authenticated user purchase history', async () => {
    const server = app.getHttpServer();

    const history = await request(server)
      .get('/v1/sales/my-purchases')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    expect(Array.isArray(history.body)).toBe(true);
    expect(history.body.length).toBeGreaterThan(0);
  });
});
