import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VehicleEntity } from './entities/vehicle.entity';
import { SaleEntity } from '../sales/entities/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity, SaleEntity])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
