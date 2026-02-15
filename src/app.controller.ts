import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Mensagem inicial',
    description: 'Endpoint basico de boas-vindas da API.',
  })
  @ApiOkResponse({
    description: 'Mensagem em texto simples.',
    schema: { example: 'Hello World!' },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
