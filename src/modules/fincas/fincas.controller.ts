import { Controller, Post, Get, Body } from '@nestjs/common';
import { FincasService } from './fincas.service';

@Controller('fincas')
export class FincasController {
  constructor(private readonly fincasService: FincasService) {}

  @Post()
  async crearFinca(@Body() body: { nombre: string; ubicacion: string }) {
    return this.fincasService.crear(body.nombre, body.ubicacion);
  }

  @Get()
  async obtenerFincas() {
    return this.fincasService.obtenerTodas();
  }
}