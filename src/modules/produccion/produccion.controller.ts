import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';

@Controller('produccion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProduccionController {
  constructor(private readonly produccionService: ProduccionService) {}

  // --- RUTAS PARA LECHE ---
  @Post('leche')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.OPERARIO)
  registrarLeche(@Body() body: any, @UsuarioActual() usuario: any) {
    return this.produccionService.registrarLeche(body, usuario.fincaId);
  }

  @Get('leche')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.OPERARIO)
  obtenerLeche(@UsuarioActual() usuario: any) {
    return this.produccionService.obtenerLeche(usuario.fincaId);
  }

  @Patch('leche/:id')
  @Roles(RolUsuario.PROPIETARIO)
  actualizarLeche(@Param('id') id: string, @Body() body: any, @UsuarioActual() usuario: any) {
    return this.produccionService.actualizarLeche(+id, body, usuario.fincaId);
  }

  @Delete('leche/:id')
  @Roles(RolUsuario.PROPIETARIO)
  eliminarLeche(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.produccionService.eliminarLeche(+id, usuario.fincaId);
  }

  // --- RUTAS PARA CARNE ---
  @Post('carne')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.OPERARIO)
  registrarCarne(@Body() body: any, @UsuarioActual() usuario: any) {
    return this.produccionService.registrarCarne(body, usuario.fincaId);
  }

  @Get('carne')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.OPERARIO)
  obtenerCarne(@UsuarioActual() usuario: any) {
    return this.produccionService.obtenerCarne(usuario.fincaId);
  }

  @Patch('carne/:id')
  @Roles(RolUsuario.PROPIETARIO)
  actualizarCarne(@Param('id') id: string, @Body() body: any, @UsuarioActual() usuario: any) {
    return this.produccionService.actualizarCarne(+id, body, usuario.fincaId);
  }

  @Delete('carne/:id')
  @Roles(RolUsuario.PROPIETARIO)
  eliminarCarne(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.produccionService.eliminarCarne(+id, usuario.fincaId);
  }
}