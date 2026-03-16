import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';

@Controller('parametros')
@UseGuards(JwtAuthGuard)
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  // --- RAZAS ---
  @Post('razas')
  createRaza(@Body() body: { nombre: string; descripcion?: string }, @UsuarioActual() usuario: any) {
    return this.parametrosService.createRaza(body, usuario.fincaId);
  }

  @Get('razas')
  findAllRazas(@UsuarioActual() usuario: any) {
    return this.parametrosService.findAllRazas(usuario.fincaId);
  }

  @Get('razas/:id')
  findOneRaza(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.findOneRaza(+id, usuario.fincaId);
  }

  @Patch('razas/:id')
  updateRaza(@Param('id') id: string, @Body() body: any, @UsuarioActual() usuario: any) {
    return this.parametrosService.updateRaza(+id, body, usuario.fincaId);
  }

  @Delete('razas/:id')
  removeRaza(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.removeRaza(+id, usuario.fincaId);
  }

  // --- LOTES ---
  @Post('lotes')
  createLote(@Body() body: { nombre: string }, @UsuarioActual() usuario: any) {
    return this.parametrosService.createLote(body, usuario.fincaId);
  }

  @Get('lotes')
  findAllLotes(@UsuarioActual() usuario: any) {
    return this.parametrosService.findAllLotes(usuario.fincaId);
  }

  @Get('lotes/:id')
  findOneLote(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.findOneLote(+id, usuario.fincaId);
  }

  @Patch('lotes/:id')
  updateLote(@Param('id') id: string, @Body() body: any, @UsuarioActual() usuario: any) {
    return this.parametrosService.updateLote(+id, body, usuario.fincaId);
  }

  @Delete('lotes/:id')
  removeLote(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.removeLote(+id, usuario.fincaId);
  }

  // --- POTREROS ---
  @Post('potreros')
  createPotrero(@Body() body: { nombre: string; ubicacion?: string }, @UsuarioActual() usuario: any) {
    return this.parametrosService.createPotrero(body, usuario.fincaId);
  }

  @Get('potreros')
  findAllPotreros(@UsuarioActual() usuario: any) {
    return this.parametrosService.findAllPotreros(usuario.fincaId);
  }

  @Get('potreros/:id')
  findOnePotrero(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.findOnePotrero(+id, usuario.fincaId);
  }

  @Patch('potreros/:id')
  updatePotrero(@Param('id') id: string, @Body() body: any, @UsuarioActual() usuario: any) {
    return this.parametrosService.updatePotrero(+id, body, usuario.fincaId);
  }

  @Delete('potreros/:id')
  removePotrero(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.removePotrero(+id, usuario.fincaId);
  }
}