import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SaludService } from './salud.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';

@Controller('salud')
@UseGuards(JwtAuthGuard) // 🛡️ Todo el módulo requiere Token
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  // Rutas para Tratamientos (ej. POST /salud/tratamientos)
  @Post('tratamientos')
  crearTratamiento(@Body() body: any, @UsuarioActual() usuario: any) {
    return this.saludService.crearTratamiento(body, usuario.fincaId);
  }

  @Get('tratamientos')
  obtenerTratamientos(@UsuarioActual() usuario: any) {
    return this.saludService.obtenerTratamientos(usuario.fincaId);
  }

  // Rutas para Vacunas (ej. POST /salud/vacunas)
  @Post('vacunas')
  registrarVacuna(@Body() body: any, @UsuarioActual() usuario: any) {
    return this.saludService.registrarVacuna(body, usuario.fincaId);
  }

  @Get('vacunas')
  obtenerVacunas(@UsuarioActual() usuario: any) {
    return this.saludService.obtenerVacunas(usuario.fincaId);
  }
}