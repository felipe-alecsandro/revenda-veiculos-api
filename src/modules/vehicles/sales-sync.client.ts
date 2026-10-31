import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VehicleEntity } from './entities/vehicle.entity';

@Injectable()
export class SalesSyncClient {
  async upsert(vehicle: VehicleEntity): Promise<void> {
    await this.request('PUT', `/integration/vehicles/${vehicle.id}`, {
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      price: vehicle.price,
      imageUrl: vehicle.imageUrl,
    });
  }

  async remove(id: string): Promise<void> {
    await this.request('DELETE', `/integration/vehicles/${id}`);
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<void> {
    const baseUrl = process.env.SALES_API_BASE_URL;
    const token = process.env.SALES_INTERNAL_TOKEN;
    if (!baseUrl || !token) {
      throw new BadGatewayException('Sales service is not configured.');
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'content-type': 'application/json',
          'x-internal-token': token,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new BadGatewayException('Sales service is unavailable.');
    }

    if (response.status === 404) {
      throw new NotFoundException(
        'Vehicle was not found in the sales service.',
      );
    }
    if (response.status === 409) {
      throw new ConflictException(
        'Vehicle cannot be changed in the sales service.',
      );
    }
    if (!response.ok) {
      throw new BadGatewayException('Sales service rejected catalog sync.');
    }
  }
}
