import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBody,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleEntity } from './entities/vehicle.entity';

const uploadsDirectory = join(process.cwd(), 'uploads');

const toSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase()
    .slice(0, 64) || 'vehicle';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @ApiOperation({
    summary: 'Listar veiculos disponiveis',
    description: 'Retorna somente os veiculos com status AVAILABLE.',
  })
  @ApiOkResponse({
    description: 'Lista de veiculos disponiveis.',
    type: VehicleEntity,
    isArray: true,
  })
  @Get()
  async listAvailable() {
    return this.vehiclesService.listAvailable();
  }

  @ApiOperation({
    summary: 'Listar veiculos vendidos',
    description: 'Retorna somente os veiculos com status SOLD.',
  })
  @ApiOkResponse({
    description: 'Lista de veiculos vendidos.',
    type: VehicleEntity,
    isArray: true,
  })
  @Get('sold')
  async listSold() {
    return this.vehiclesService.listSold();
  }

  @ApiOperation({
    summary: 'Buscar veiculo por ID',
    description: 'Retorna os detalhes de um veiculo especifico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do veiculo.',
    example: '7c5a7a87-aefe-46ec-b6f3-4514fd008d9b',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiOkResponse({
    description: 'Veiculo encontrado.',
    type: VehicleEntity,
  })
  @ApiNotFoundResponse({
    description: 'Vehicle <id> not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Vehicle 7c5a7a87-aefe-46ec-b6f3-4514fd008d9b not found.',
        error: 'Not Found',
      },
    },
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }

  @ApiOperation({
    summary: 'Cadastrar veiculo',
    description: 'Cria um novo veiculo com status inicial AVAILABLE.',
  })
  @ApiCreatedResponse({
    description: 'Veiculo criado com sucesso.',
    type: VehicleEntity,
  })
  @ApiBody({
    type: CreateVehicleDto,
    description: 'Payload para cadastro de veiculo.',
    examples: {
      sedan: {
        summary: 'Cadastro de sedan',
        value: {
          brand: 'Toyota',
          model: 'Corolla XEi',
          year: 2022,
          color: 'Preto',
          price: 129900,
          imageUrl:
            'http://localhost:3000/uploads/1731450000000-123456789-corolla-xei.png',
        },
      },
      suv: {
        summary: 'Cadastro de SUV',
        value: {
          brand: 'Jeep',
          model: 'Compass Longitude',
          year: 2021,
          color: 'Branco',
          price: 149900,
          imageUrl:
            'http://localhost:3000/uploads/1731450000001-123456789-compass.png',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    schema: {
      example: {
        statusCode: 400,
        message: ['year must not be greater than 2100'],
        error: 'Bad Request',
      },
    },
  })
  @Post()
  async create(@Body() body: CreateVehicleDto) {
    return this.vehiclesService.create(body);
  }

  @ApiOperation({
    summary: 'Atualizar veiculo',
    description: 'Atualiza parcialmente os dados de um veiculo existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do veiculo.',
    example: '7c5a7a87-aefe-46ec-b6f3-4514fd008d9b',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiOkResponse({
    description: 'Veiculo atualizado com sucesso.',
    type: VehicleEntity,
  })
  @ApiBody({
    type: UpdateVehicleDto,
    description: 'Payload parcial para atualizacao de veiculo.',
    examples: {
      alterarPrecoCor: {
        summary: 'Atualizar preco e cor',
        value: {
          color: 'Cinza',
          price: 124900,
          imageUrl:
            'http://localhost:3000/uploads/1731450000002-123456789-corolla.png',
        },
      },
      alterarModelo: {
        summary: 'Atualizar modelo',
        value: {
          model: 'Corolla Altis Hybrid',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    schema: {
      example: {
        statusCode: 400,
        message: ['price must not be less than 0.01'],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Vehicle <id> not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Vehicle 7c5a7a87-aefe-46ec-b6f3-4514fd008d9b not found.',
        error: 'Not Found',
      },
    },
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateVehicleDto) {
    return this.vehiclesService.update(id, body);
  }

  @ApiOperation({
    summary: 'Excluir veiculo (hard delete)',
    description:
      'Remove permanentemente o veiculo. Caso exista venda vinculada, o registro de venda tambem e removido.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do veiculo.',
    example: '7c5a7a87-aefe-46ec-b6f3-4514fd008d9b',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiNoContentResponse({
    description: 'Veiculo removido com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Vehicle <id> not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Vehicle 7c5a7a87-aefe-46ec-b6f3-4514fd008d9b not found.',
        error: 'Not Found',
      },
    },
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.vehiclesService.hardDelete(id);
  }

  @ApiOperation({
    summary: 'Upload de imagem do veiculo',
    description:
      'Recebe um arquivo de imagem, salva no servidor e retorna a URL publica para persistencia em imageUrl.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (jpg, jpeg, png, webp).',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Upload concluido com sucesso.',
    schema: {
      example: {
        imageUrl:
          'http://localhost:3000/uploads/1731450000000-123456789-corolla-xei.png',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Arquivo ausente, formato invalido ou tamanho excedido.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Somente imagens jpg, jpeg, png ou webp sao permitidas.',
        error: 'Bad Request',
      },
    },
  })
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          if (!existsSync(uploadsDirectory)) {
            mkdirSync(uploadsDirectory, { recursive: true });
          }
          callback(null, uploadsDirectory);
        },
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase() || '.jpg';
          const baseName = toSlug(file.originalname.replace(/\.[^/.]+$/, ''));
          callback(
            null,
            `${Date.now()}-${Math.floor(Math.random() * 1_000_000_000)}-${baseName}${extension}`,
          );
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = new Set([
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ]);
        if (!allowedMimeTypes.has(file.mimetype.toLowerCase())) {
          callback(
            new BadRequestException(
              'Somente imagens jpg, jpeg, png ou webp sao permitidas.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(
    @UploadedFile() file: { filename: string } | undefined,
    @Req() request: Request,
  ) {
    if (!file?.filename) {
      throw new BadRequestException('Arquivo de imagem nao enviado.');
    }
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return {
      imageUrl: `${baseUrl}/uploads/${file.filename}`,
    };
  }
}
