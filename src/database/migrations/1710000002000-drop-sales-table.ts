import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropSalesTable1710000002000 implements MigrationInterface {
  name = 'DropSalesTable1710000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS sales;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';
    const idType = isPostgres ? 'uuid' : 'varchar(36)';
    const dateTimeType = isPostgres ? 'timestamptz' : 'datetime';
    const nowExpr = isPostgres ? 'now()' : 'CURRENT_TIMESTAMP';

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
  }
}
