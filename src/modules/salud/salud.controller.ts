import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SaludService } from './salud.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';
import { CrearTratamientoDto, ActualizarTratamientoDto } from './dto/tratamiento.dto';
import { CrearVacunaDto, ActualizarVacunaDto } from './dto/vacuna.dto';

@Controller('salud')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  // --- TRATAMIENTOS ---
  @Post('tratamientos')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  crearTratamiento(@Body() body: CrearTratamientoDto, @UsuarioActual() usuario: any) {
    return this.saludService.crearTratamiento(body, usuario.fincaId);
  }

  @Get('tratamientos')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerTratamientos(@UsuarioActual() usuario: any) {
    return this.saludService.obtenerTratamientos(usuario.fincaId);
  }

  @Patch('tratamientos/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  actualizarTratamiento(@Param('id') id: string, @Body() body: ActualizarTratamientoDto, @UsuarioActual() usuario: any) {
    return this.saludService.actualizarTratamiento(+id, body, usuario.fincaId);
  }

  @Delete('tratamientos/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  eliminarTratamiento(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.saludService.eliminarTratamiento(+id, usuario.fincaId);
  }

  // --- VACUNAS ---
  @Post('vacunas')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  registrarVacuna(@Body() body: CrearVacunaDto, @UsuarioActual() usuario: any) {
    return this.saludService.registrarVacuna(body, usuario.fincaId);
  }

  @Get('vacunas')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerVacunas(@UsuarioActual() usuario: any) {
    return this.saludService.obtenerVacunas(usuario.fincaId);
  }

  @Patch('vacunas/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  actualizarVacuna(@Param('id') id: string, @Body() body: ActualizarVacunaDto, @UsuarioActual() usuario: any) {
    return this.saludService.actualizarVacuna(+id, body, usuario.fincaId);
  }

  @Delete('vacunas/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  eliminarVacuna(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.saludService.eliminarVacuna(+id, usuario.fincaId);
  }
}