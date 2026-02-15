import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleEntity } from '../../vehicles/entities/vehicle.entity';

@Entity('sales')
export class SaleEntity {
  @ApiProperty({
    example: '5a7d0e09-503c-45f9-9fe5-59d48816e7fa',
    description: 'Identificador unico da venda.',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '7c5a7a87-aefe-46ec-b6f3-4514fd008d9b',
    description: 'Identificador do veiculo vendido.',
  })
  @Column({ name: 'vehicle_id', type: 'uuid', unique: true })
  vehicleId!: string;

  @ApiPropertyOptional({
    type: () => VehicleEntity,
    description: 'Dados completos do veiculo (quando carregado via join).',
  })
  @ManyToOne(() => VehicleEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: VehicleEntity;

  @ApiProperty({
    example: 'f32a02dd-c7c4-4659-a7f8-c08c6f85285d',
    description: 'Identificador do comprador no provedor de identidade.',
  })
  @Column({ name: 'buyer_id', type: 'varchar', length: 255 })
  buyerId!: string;

  @ApiProperty({
    example: 'cliente@email.com',
    description: 'Email do comprador.',
  })
  @Column({ name: 'buyer_email', type: 'varchar', length: 255 })
  buyerEmail!: string;

  @ApiProperty({
    example: 129900,
    description: 'Preco efetivo da venda.',
  })
  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  salePrice!: number;

  @ApiProperty({
    example: '2026-02-12T11:40:00.000Z',
    description: 'Data/hora em que a venda foi concluida.',
  })
  @Column({ name: 'sold_at', type: 'varchar', length: 50 })
  soldAt!: string;

  @ApiProperty({
    example: '2026-02-12T11:40:01.000Z',
    description: 'Data de criacao do registro da venda.',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
