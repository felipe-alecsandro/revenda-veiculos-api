import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @ApiOperation({
    summary: 'Health check da API',
    description: 'Endpoint simples para monitoramento de disponibilidade.',
  })
  @ApiOkResponse({
    description: 'Status operacional da API.',
    schema: {
      example: {
        status: 'ok',
        service: 'revenda-veiculos-api',
        timestamp: '2026-02-12T13:00:00.000Z',
      },
    },
  })
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'revenda-veiculos-api',
      timestamp: new Date().toISOString(),
    };
  }
}
