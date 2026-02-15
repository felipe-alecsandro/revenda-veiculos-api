import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    example: 'Toyota',
    description: 'Marca do veiculo.',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: 'Corolla GLi',
    description: 'Modelo do veiculo.',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    example: 2023,
    minimum: 1900,
    maximum: 2100,
    description: 'Ano de fabricacao.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    example: 'Branco',
    description: 'Cor principal do veiculo.',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    example: 114900,
    minimum: 0.01,
    description: 'Preco de venda.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price?: number;

  @ApiPropertyOptional({
    example:
      'http://localhost:3000/uploads/1731450000000-123456789-corolla-xei.png',
    description: 'URL publica da imagem do veiculo.',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}
