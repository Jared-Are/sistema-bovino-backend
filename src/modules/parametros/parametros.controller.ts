import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';
// DTOs
import { CrearRazaDto, ActualizarRazaDto } from './dto/raza.dto';
import { CrearLoteDto, ActualizarLoteDto } from './dto/lote.dto';
import { CrearPotreroDto, ActualizarPotreroDto } from './dto/potrero.dto';

@Controller('parametros')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  // 🐮 RUTAS PARA RAZAS
  @Post('razas')
  @Roles(RolUsuario.PROPIETARIO)
  crearRaza(@Body() body: CrearRazaDto, @UsuarioActual() usuario: any) {
    return this.parametrosService.crearRaza(body, usuario.fincaId);
  }

  @Get('razas')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerRazas(@UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerRazas(usuario.fincaId);
  }

  @Get('razas/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerRazaPorId(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerRazaPorId(+id, usuario.fincaId);
  }

  @Patch('razas/:id')
  @Roles(RolUsuario.PROPIETARIO)
  actualizarRaza(@Param('id') id: string, @Body() body: ActualizarRazaDto, @UsuarioActual() usuario: any) {
    return this.parametrosService.actualizarRaza(+id, body, usuario.fincaId);
  }

  @Delete('razas/:id')
  @Roles(RolUsuario.PROPIETARIO)
  eliminarRaza(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.eliminarRaza(+id, usuario.fincaId);
  }

  // 🏡 RUTAS PARA LOTES
  @Post('lotes')
  @Roles(RolUsuario.PROPIETARIO)
  crearLote(@Body() body: CrearLoteDto, @UsuarioActual() usuario: any) {
    return this.parametrosService.crearLote(body, usuario.fincaId);
  }
  
  @Get('lotes')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerLotes(@UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerLotes(usuario.fincaId);
  }

  @Get('lotes/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerLotePorId(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerLotePorId(+id, usuario.fincaId);
  }

  @Patch('lotes/:id')
  @Roles(RolUsuario.PROPIETARIO)
  actualizarLote(@Param('id') id: string, @Body() body: ActualizarLoteDto, @UsuarioActual() usuario: any) {
    return this.parametrosService.actualizarLote(+id, body, usuario.fincaId);
  }

  @Delete('lotes/:id')
  @Roles(RolUsuario.PROPIETARIO)
  eliminarLote(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.eliminarLote(+id, usuario.fincaId);
  }

  // 🌱 RUTAS PARA POTREROS
  @Post('potreros')
  @Roles(RolUsuario.PROPIETARIO)
  crearPotrero(@Body() body: CrearPotreroDto, @UsuarioActual() usuario: any) {
    return this.parametrosService.crearPotrero(body, usuario.fincaId);
  }

  @Get('potreros')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerPotreros(@UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerPotreros(usuario.fincaId);
  }

  @Get('potreros/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerPotreroPorId(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.obtenerPotreroPorId(+id, usuario.fincaId);
  }

  @Patch('potreros/:id')
  @Roles(RolUsuario.PROPIETARIO)
  actualizarPotrero(@Param('id') id: string, @Body() body: ActualizarPotreroDto, @UsuarioActual() usuario: any) {
    return this.parametrosService.actualizarPotrero(+id, body, usuario.fincaId);
  }

  @Delete('potreros/:id')
  @Roles(RolUsuario.PROPIETARIO)
  eliminarPotrero(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.parametrosService.eliminarPotrero(+id, usuario.fincaId);
  }
}