import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';

@Controller('produccion')
@UseGuards(JwtAuthGuard) // 🛡️ Aislamiento SaaS Activado
export class ProduccionController {
  constructor(private readonly produccionService: ProduccionService) {}

  // --- RUTAS PARA LECHE ---
  @Post('leche')
  registrarLeche(@Body() body: any, @UsuarioActual() usuario: any) {
    return this.produccionService.registrarLeche(body, usuario.fincaId);
  }

  @Get('leche')
  obtenerLeche(@UsuarioActual() usuario: any) {
    return this.produccionService.obtenerLeche(usuario.fincaId);
  }

  // --- RUTAS PARA CARNE ---
  @Post('carne')
  registrarCarne(@Body() body: any, @UsuarioActual() usuario: any) {
    return this.produccionService.registrarCarne(body, usuario.fincaId);
  }

  @Get('carne')
  obtenerCarne(@UsuarioActual() usuario: any) {
    return this.produccionService.obtenerCarne(usuario.fincaId);
  }
}