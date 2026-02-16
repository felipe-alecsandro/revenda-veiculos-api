import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleEntity } from '../sales/entities/sale.entity';
import { VehicleEntity } from './entities/vehicle.entity';

type CreateVehicleInput = Pick<
  VehicleEntity,
  'brand' | 'model' | 'year' | 'color' | 'price'
> & {
  imageUrl?: string | null;
};
type UpdateVehicleInput = Partial<CreateVehicleInput>;

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(SaleEntity)
    private readonly salesRepository: Repository<SaleEntity>,
  ) {}

  async create(input: CreateVehicleInput): Promise<VehicleEntity> {
    const vehicle = this.vehiclesRepository.create({
      id: randomUUID(),
      ...input,
      status: 'AVAILABLE',
    });
    return this.vehiclesRepository.save(vehicle);
  }

  async update(id: string, input: UpdateVehicleInput): Promise<VehicleEntity> {
    const vehicle = await this.findById(id);
    const definedInput = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as UpdateVehicleInput;
    Object.assign(vehicle, definedInput);
    return this.vehiclesRepository.save(vehicle);
  }

  async listAvailable(): Promise<VehicleEntity[]> {
    return this.vehiclesRepository.find({
      where: { status: 'AVAILABLE' },
      order: { price: 'ASC' },
    });
  }

  async listSold(): Promise<VehicleEntity[]> {
    return this.vehiclesRepository.find({
      where: { status: 'SOLD' },
      order: { price: 'ASC' },
    });
  }

  async findById(id: string): Promise<VehicleEntity> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found.`);
    }
    return vehicle;
  }

  async markAsSold(id: string): Promise<VehicleEntity> {
    const vehicle = await this.findById(id);
    vehicle.status = 'SOLD';
    return this.vehiclesRepository.save(vehicle);
  }

  async hardDelete(id: string): Promise<void> {
    await this.findById(id);

    await this.vehiclesRepository.manager.transaction(async (manager) => {
      await manager.delete(SaleEntity, { vehicleId: id });
      await manager.delete(VehicleEntity, { id });
    });
  }
}
