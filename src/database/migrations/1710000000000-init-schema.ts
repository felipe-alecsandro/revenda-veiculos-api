import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1710000000000 implements MigrationInterface {
  name = 'InitSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';
    const idType = isPostgres ? 'uuid' : 'varchar(36)';
    const dateTimeType = isPostgres ? 'timestamptz' : 'datetime';
    const nowExpr = isPostgres ? 'now()' : 'CURRENT_TIMESTAMP';

    if (isPostgres) {
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id ${idType} PRIMARY KEY,
        brand varchar(100) NOT NULL,
        model varchar(100) NOT NULL,
        year int NOT NULL,
        color varchar(50) NOT NULL,
        price numeric(12, 2) NOT NULL CHECK (price > 0),
        status varchar(20) NOT NULL DEFAULT 'AVAILABLE',
        created_at ${dateTimeType} NOT NULL DEFAULT ${nowExpr},
        updated_at ${dateTimeType} NOT NULL DEFAULT ${nowExpr}
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id ${idType} PRIMARY KEY,
        vehicle_id ${idType} NOT NULL UNIQUE REFERENCES vehicles(id),
        buyer_id varchar(255) NOT NULL,
        buyer_email varchar(255) NOT NULL,
        sale_price numeric(12, 2) NOT NULL CHECK (sale_price > 0),
        sold_at varchar(50) NOT NULL,
        created_at ${dateTimeType} NOT NULL DEFAULT ${nowExpr}
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vehicles_status_price
      ON vehicles(status, price);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_buyer_id
      ON sales(buyer_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sales_buyer_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vehicles_status_price;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sales;`);
    await queryRunner.query(`DROP TABLE IF EXISTS vehicles;`);
  }
}
