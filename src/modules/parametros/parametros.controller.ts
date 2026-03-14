import { Controller, Post, Get, Body } from '@nestjs/common';
import { ParametrosService } from './parametros.service';

@Controller('parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  // --- RAZAS ---
  @Post('razas')
  async crearRaza(@Body() body: { nombre: string; descripcion: string; fincaId: number }) {
    return this.parametrosService.crearRaza(body.nombre, body.descripcion, body.fincaId);
  }

  @Get('razas')
  async obtenerRazas() {
    return this.parametrosService.obtenerRazas();
  }

  // --- LOTES ---
  @Post('lotes') // URL: http://localhost:3000/parametros/lotes
  async crearLote(@Body() body: { nombre: string; fincaId: number }) {
    return this.parametrosService.crearLote(body.nombre, body.fincaId);
  }

  // --- POTREROS ---
  @Post('potreros') // URL: http://localhost:3000/parametros/potreros
  async crearPotrero(@Body() body: { nombre: string; fincaId: number }) {
    return this.parametrosService.crearPotrero(body.nombre, body.fincaId);
  }
}