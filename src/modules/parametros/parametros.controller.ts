import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';

@Controller('parametros')
@UseGuards(JwtAuthGuard)
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  // --- RAZAS ---
  @Get('razas')
  async obtenerRazas() {
    return this.parametrosService.obtenerRazas();
  }

  // --- LOTES ---
  @Post('lotes')
  async crearLote(
    @Body() body: { nombre: string }, 
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.crearLote(body.nombre, usuario.fincaId);
  }
  
  @Get('lotes')
  async obtenerLotes(@UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerLotes(usuario.fincaId);
  }

  @Patch('lotes/:id')
  async actualizarLote(
    @Param('id') id: string,
    @Body() body: { nombre: string },
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.actualizarLote(+id, body.nombre, usuario.fincaId);
  }

  @Delete('lotes/:id')
  async eliminarLote(
    @Param('id') id: string,
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.eliminarLote(+id, usuario.fincaId);
  }

  // --- POTREROS ---
  @Post('potreros')
  async crearPotrero(
    @Body() body: { nombre: string }, 
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.crearPotrero(body.nombre, usuario.fincaId);
  }

  @Get('potreros')
  async obtenerPotreros(@UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerPotreros(usuario.fincaId);
  }

  @Patch('potreros/:id')
  async actualizarPotrero(
    @Param('id') id: string,
    @Body() body: { nombre: string },
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.actualizarPotrero(+id, body.nombre, usuario.fincaId);
  }

  @Delete('potreros/:id')
  async eliminarPotrero(
    @Param('id') id: string,
    @UsuarioActual() usuario: any
  ) {
    return this.parametrosService.eliminarPotrero(+id, usuario.fincaId);
  }
}