import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ReproduccionService } from './reproduccion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';

@Controller('reproduccion')
@UseGuards(JwtAuthGuard)
export class ReproduccionController {
  constructor(private readonly reproduccionService: ReproduccionService) {}

  @Post('montas')
  registrarMonta(@Body() body: any, @UsuarioActual() usuario: any) {
    return this.reproduccionService.registrarMonta(body, usuario.fincaId);
  }

  @Get('montas')
  obtenerMontas(@UsuarioActual() usuario: any) {
    return this.reproduccionService.obtenerMontas(usuario.fincaId);
  }

  @Post('diagnosticos')
  registrarDiagnostico(@Body() body: any, @UsuarioActual() usuario: any) {
    // Pasamos el fincaId para aislamiento y el userId para la notificación personalizada
    return this.reproduccionService.registrarDiagnostico(body, usuario.fincaId, usuario.userId);
  }

  @Get('diagnosticos')
  obtenerDiagnosticos(@UsuarioActual() usuario: any) {
    return this.reproduccionService.obtenerDiagnosticos(usuario.fincaId);
  }

  @Post('partos')
  registrarParto(@Body() body: any, @UsuarioActual() usuario: any) {
    return this.reproduccionService.registrarParto(body, usuario.fincaId, usuario.userId);
  }

  @Get('partos')
  obtenerPartos(@UsuarioActual() usuario: any) {
    return this.reproduccionService.obtenerPartos(usuario.fincaId);
  }
}