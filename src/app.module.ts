import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { VehicleEntity } from './modules/vehicles/entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:
        process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL
          ? 'sqlite'
          : 'postgres',
      database:
        process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL
          ? (process.env.DATABASE_SQLITE_PATH ?? ':memory:')
          : undefined,
      url: process.env.DATABASE_URL,
      entities: [VehicleEntity],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      migrationsRun:
        process.env.NODE_ENV !== 'test' && Boolean(process.env.DATABASE_URL),
      synchronize: process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL,
      dropSchema: process.env.NODE_ENV === 'test',
      logging: false,
    }),
    VehiclesModule,
    HealthModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
