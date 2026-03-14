import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AnimalesService } from './animales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';

@Controller('animales')
@UseGuards(JwtAuthGuard) // 🛡️ Todo este módulo requiere que muestres tu Token
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

  @Post()
  create(@Body() body: any, @UsuarioActual() usuario: any) {
    // Le pasamos el cuerpo de la petición Y el ID de su finca
    return this.animalesService.create(body, usuario.fincaId);
  }

  @Get()
  findAll(@UsuarioActual() usuario: any) {
    // ¡Solo trae las vacas de SU finca! (Aislamiento SaaS)
    return this.animalesService.findAll(usuario.fincaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.animalesService.findOne(+id, usuario.fincaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @UsuarioActual() usuario: any) {
    return this.animalesService.update(+id, body, usuario.fincaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.animalesService.remove(+id, usuario.fincaId);
  }
}