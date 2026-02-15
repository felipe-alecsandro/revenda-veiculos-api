import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SalesService } from './sales.service';
import { CognitoAuthGuard } from '../auth/cognito-auth.guard';
import { type AuthenticatedUser } from '../auth/auth.service';
import { PurchaseVehicleDto } from './dto/purchase-vehicle.dto';
import { SaleEntity } from './entities/sale.entity';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@ApiTags('Sales')
@ApiBearerAuth('cognito-jwt')
@Controller('sales')
@UseGuards(CognitoAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @ApiOperation({
    summary: 'Comprar veiculo',
    description:
      'Realiza a compra de um veiculo disponivel para o usuario autenticado.',
  })
  @ApiCreatedResponse({
    description: 'Compra realizada com sucesso.',
    type: SaleEntity,
  })
  @ApiBody({
    type: PurchaseVehicleDto,
    description: 'Payload para compra de um veiculo.',
    examples: {
      compraPadrao: {
        summary: 'Compra com vehicleId valido',
        value: {
          vehicleId: '7c5a7a87-aefe-46ec-b6f3-4514fd008d9b',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido (ex.: vehicleId ausente ou nao UUID).',
    schema: {
      example: {
        statusCode: 400,
        message: ['vehicleId must be a UUID'],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication failed.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Authentication failed.',
        error: 'Unauthorized',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Vehicle was not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Vehicle was not found.',
        error: 'Not Found',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Vehicle is no longer available.',
    schema: {
      example: {
        statusCode: 409,
        message: 'Vehicle is no longer available.',
        error: 'Conflict',
      },
    },
  })
  @Post()
  async purchase(
    @Body() body: PurchaseVehicleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const identity = req.user as AuthenticatedUser;
    return this.salesService.purchase(
      body.vehicleId,
      identity.userId,
      identity.email,
    );
  }

  @ApiOperation({
    summary: 'Listar minhas compras',
    description:
      'Retorna todas as compras do usuario autenticado ordenadas da mais recente para a mais antiga.',
  })
  @ApiOkResponse({
    description: 'Lista de compras do usuario autenticado.',
    type: SaleEntity,
    isArray: true,
    schema: {
      example: [
        {
          id: '5a7d0e09-503c-45f9-9fe5-59d48816e7fa',
          vehicleId: '7c5a7a87-aefe-46ec-b6f3-4514fd008d9b',
          buyerId: 'f32a02dd-c7c4-4659-a7f8-c08c6f85285d',
          buyerEmail: 'cliente@email.com',
          salePrice: 129900,
          soldAt: '2026-02-12T11:40:00.000Z',
          createdAt: '2026-02-12T11:40:01.000Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication failed.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Authentication failed.',
        error: 'Unauthorized',
      },
    },
  })
  @Get('my-purchases')
  async listMyPurchases(@Req() req: AuthenticatedRequest) {
    const identity = req.user as AuthenticatedUser;
    return this.salesService.listMyPurchases(identity.userId);
  }
}
