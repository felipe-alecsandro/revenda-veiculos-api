import 'dotenv/config';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { VehicleEntity } from '../modules/vehicles/entities/vehicle.entity';
import { SaleEntity } from '../modules/sales/entities/sale.entity';
import { InitSchema1710000000000 } from './migrations/1710000000000-init-schema';
import { AddImageUrlToVehicles1710000001000 } from './migrations/1710000001000-add-image-url-to-vehicles';

const isPostgres = Boolean(process.env.DATABASE_URL);

const options: DataSourceOptions = isPostgres
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [VehicleEntity, SaleEntity],
      migrations: [InitSchema1710000000000, AddImageUrlToVehicles1710000001000],
      synchronize: false,
    }
  : {
      type: 'sqlite',
      database: process.env.DATABASE_SQLITE_PATH ?? 'local-dev.sqlite',
      entities: [VehicleEntity, SaleEntity],
      migrations: [InitSchema1710000000000, AddImageUrlToVehicles1710000001000],
      synchronize: false,
    };

export const AppDataSource = new DataSource(options);
