import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { AuthModule } from '../auth/auth.module';
import { SaleEntity } from './entities/sale.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleEntity, VehicleEntity]),
    VehiclesModule,
    AuthModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
