import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PurchaseVehicleDto {
  @ApiProperty({
    example: '7c5a7a87-aefe-46ec-b6f3-4514fd008d9b',
    format: 'uuid',
    description: 'ID do veiculo que sera comprado.',
  })
  @IsUUID()
  vehicleId!: string;
}
