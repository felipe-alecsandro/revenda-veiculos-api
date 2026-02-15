import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'Toyota',
    description: 'Marca do veiculo.',
  })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({
    example: 'Corolla XEi',
    description: 'Modelo do veiculo.',
  })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({
    example: 2022,
    minimum: 1900,
    maximum: 2100,
    description: 'Ano de fabricacao.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @ApiProperty({
    example: 'Preto',
    description: 'Cor principal do veiculo.',
  })
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiProperty({
    example: 129900,
    minimum: 0.01,
    description: 'Preco de venda.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price!: number;

  @ApiProperty({
    required: false,
    example:
      'http://localhost:3000/uploads/1731450000000-123456789-corolla-xei.png',
    description: 'URL publica da imagem do veiculo.',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}
