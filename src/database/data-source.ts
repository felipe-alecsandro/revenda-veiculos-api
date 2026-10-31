import 'dotenv/config';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { VehicleEntity } from '../modules/vehicles/entities/vehicle.entity';
import { InitSchema1710000000000 } from './migrations/1710000000000-init-schema';
import { AddImageUrlToVehicles1710000001000 } from './migrations/1710000001000-add-image-url-to-vehicles';
import { DropSalesTable1710000002000 } from './migrations/1710000002000-drop-sales-table';

const isPostgres = Boolean(process.env.DATABASE_URL);

const options: DataSourceOptions = isPostgres
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [VehicleEntity],
      migrations: [
        InitSchema1710000000000,
        AddImageUrlToVehicles1710000001000,
        DropSalesTable1710000002000,
      ],
      synchronize: false,
    }
  : {
      type: 'sqlite',
      database: process.env.DATABASE_SQLITE_PATH ?? 'local-dev.sqlite',
      entities: [VehicleEntity],
      migrations: [
        InitSchema1710000000000,
        AddImageUrlToVehicles1710000001000,
        DropSalesTable1710000002000,
      ],
      synchronize: false,
    };

export const AppDataSource = new DataSource(options);
