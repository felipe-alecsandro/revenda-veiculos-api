import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageUrlToVehicles1710000001000 implements MigrationInterface {
  name = 'AddImageUrlToVehicles1710000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';

    if (isPostgres) {
      const result = (await queryRunner.query(`
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vehicles'
          AND column_name = 'image_url'
        LIMIT 1;
      `)) as unknown[];

      if (result.length === 0) {
        await queryRunner.query(`
          ALTER TABLE vehicles
          ADD COLUMN image_url varchar(2048) NULL;
        `);
      }
      return;
    }

    const sqliteColumns = (await queryRunner.query(
      `PRAGMA table_info('vehicles');`,
    )) as Array<{ name?: string }>;
    const hasImageUrl = sqliteColumns.some(
      (column) => column.name === 'image_url',
    );

    if (!hasImageUrl) {
      await queryRunner.query(`
        ALTER TABLE vehicles
        ADD COLUMN image_url varchar(2048);
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';
    if (!isPostgres) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE vehicles
      DROP COLUMN IF EXISTS image_url;
    `);
  }
}
