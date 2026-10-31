import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesSyncClient } from './sales-sync.client';
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
    private readonly salesSyncClient: SalesSyncClient,
  ) {}

  async create(input: CreateVehicleInput): Promise<VehicleEntity> {
    const vehicle = await this.vehiclesRepository.save(
      this.vehiclesRepository.create({
        id: randomUUID(),
        ...input,
        status: 'AVAILABLE',
      }),
    );

    try {
      await this.salesSyncClient.upsert(vehicle);
    } catch (error) {
      await this.vehiclesRepository.delete({ id: vehicle.id });
      throw this.asSyncError(error);
    }
    return vehicle;
  }

  async update(id: string, input: UpdateVehicleInput): Promise<VehicleEntity> {
    const vehicle = await this.findById(id);
    const previous = {
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      price: vehicle.price,
      imageUrl: vehicle.imageUrl,
    };
    const definedInput = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as UpdateVehicleInput;
    Object.assign(vehicle, definedInput);
    const saved = await this.vehiclesRepository.save(vehicle);

    try {
      await this.salesSyncClient.upsert(saved);
    } catch (error) {
      Object.assign(saved, previous);
      await this.vehiclesRepository.save(saved);
      throw this.asSyncError(error);
    }
    return saved;
  }

  async findById(id: string): Promise<VehicleEntity> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found.`);
    }
    return vehicle;
  }

  async hardDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.salesSyncClient.remove(id);
    await this.vehiclesRepository.delete({ id });
  }

  private asSyncError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new BadGatewayException('Sales service rejected catalog sync.');
  }
}
