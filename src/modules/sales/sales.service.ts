import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SaleEntity } from './entities/sale.entity';
import { VehicleEntity } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly salesRepository: Repository<SaleEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async purchase(
    vehicleId: string,
    buyerId: string,
    buyerEmail: string,
  ): Promise<SaleEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const supportsPessimisticLock =
        queryRunner.connection.options.type !== 'sqlite';
      const vehicle = await queryRunner.manager.findOne(VehicleEntity, {
        where: { id: vehicleId },
        lock: supportsPessimisticLock
          ? { mode: 'pessimistic_write' }
          : undefined,
      });
      if (!vehicle) {
        throw new NotFoundException('Vehicle was not found.');
      }

      if (vehicle.status !== 'AVAILABLE') {
        throw new ConflictException('Vehicle is no longer available.');
      }

      vehicle.status = 'SOLD';
      await queryRunner.manager.save(vehicle);

      const sale = queryRunner.manager.create(SaleEntity, {
        id: randomUUID(),
        vehicleId,
        buyerId,
        buyerEmail,
        soldAt: new Date().toISOString(),
        salePrice: vehicle.price,
      });
      const savedSale = await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return savedSale;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listMyPurchases(buyerId: string): Promise<SaleEntity[]> {
    return this.salesRepository.find({
      where: { buyerId },
      order: { soldAt: 'DESC' },
    });
  }
}
