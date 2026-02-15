import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type VehicleStatus = 'AVAILABLE' | 'SOLD';

@Entity('vehicles')
export class VehicleEntity {
  @ApiProperty({
    example: '7c5a7a87-aefe-46ec-b6f3-4514fd008d9b',
    description: 'Identificador unico do veiculo.',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Toyota', description: 'Marca do veiculo.' })
  @Column({ type: 'varchar', length: 100 })
  brand!: string;

  @ApiProperty({ example: 'Corolla XEi', description: 'Modelo do veiculo.' })
  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @ApiProperty({ example: 2022, description: 'Ano de fabricacao.' })
  @Column({ type: 'int' })
  year!: number;

  @ApiProperty({ example: 'Preto', description: 'Cor principal do veiculo.' })
  @Column({ type: 'varchar', length: 50 })
  color!: string;

  @ApiProperty({ example: 129900, description: 'Preco do veiculo.' })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  price!: number;

  @ApiPropertyOptional({
    example:
      'http://localhost:3000/uploads/1731450000000-123456789-corolla-xei.png',
    description: 'URL publica da imagem do veiculo.',
  })
  @Column({ name: 'image_url', type: 'varchar', length: 2048, nullable: true })
  imageUrl!: string | null;

  @ApiProperty({
    enum: ['AVAILABLE', 'SOLD'],
    example: 'AVAILABLE',
    description: 'Status do veiculo no estoque.',
  })
  @Column({ type: 'varchar', length: 20, default: 'AVAILABLE' })
  status!: VehicleStatus;

  @ApiProperty({
    example: '2026-02-12T11:30:00.000Z',
    description: 'Data de criacao do registro.',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-02-12T11:35:00.000Z',
    description: 'Data da ultima atualizacao do registro.',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
