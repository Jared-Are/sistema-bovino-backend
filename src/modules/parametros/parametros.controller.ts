import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';

@Controller('parametros')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  // --- RAZAS ---
  @Post('razas')
  @Roles(RolUsuario.PROPIETARIO)
  async crearRaza(
    @Body() body: { nombre: string; descripcion: string }, 
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.crearRaza(body.nombre, body.descripcion, usuario.fincaId);
  }

  @Get('razas')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  async obtenerRazas(@UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerRazas(usuario.fincaId);
  }

  @Patch('razas/:id')
  @Roles(RolUsuario.PROPIETARIO)
  async actualizarRaza(
    @Param('id') id: string,
    @Body() body: { nombre?: string; descripcion?: string },
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.actualizarRaza(+id, body, usuario.fincaId);
  }

  @Delete('razas/:id')
  @Roles(RolUsuario.PROPIETARIO)
  async eliminarRaza(
    @Param('id') id: string,
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.eliminarRaza(+id, usuario.fincaId);
  }

  // --- LOTES ---
  @Post('lotes')
  @Roles(RolUsuario.PROPIETARIO)
  async crearLote(
    @Body() body: { nombre: string }, 
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.crearLote(body.nombre, usuario.fincaId);
  }
  
  @Get('lotes')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  async obtenerLotes(@UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerLotes(usuario.fincaId);
  }

  @Patch('lotes/:id')
  @Roles(RolUsuario.PROPIETARIO)
  async actualizarLote(
    @Param('id') id: string,
    @Body() body: { nombre: string },
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.actualizarLote(+id, body.nombre, usuario.fincaId);
  }

  @Delete('lotes/:id')
  @Roles(RolUsuario.PROPIETARIO)
  async eliminarLote(
    @Param('id') id: string,
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.eliminarLote(+id, usuario.fincaId);
  }

  // --- POTREROS ---
  @Post('potreros')
  @Roles(RolUsuario.PROPIETARIO)
  async crearPotrero(
    @Body() body: { nombre: string }, 
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.crearPotrero(body.nombre, usuario.fincaId);
  }

  @Get('potreros')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  async obtenerPotreros(@UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerPotreros(usuario.fincaId);
  }

  @Patch('potreros/:id')
  @Roles(RolUsuario.PROPIETARIO)
  async actualizarPotrero(
    @Param('id') id: string,
    @Body() body: { nombre: string },
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.actualizarPotrero(+id, body.nombre, usuario.fincaId);
  }

  @Delete('potreros/:id')
  @Roles(RolUsuario.PROPIETARIO)
  async eliminarPotrero(
    @Param('id') id: string,
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.eliminarPotrero(+id, usuario.fincaId);
  }
}