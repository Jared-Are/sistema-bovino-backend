import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common'; 
import { FincasService } from './fincas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';       
import { UsuarioActual } from '../../common/decorators/usuario.decorator';

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

  @Get('parametros/fincas')
  @UseGuards(JwtAuthGuard)  
  obtenerFincasPorUsuario(@UsuarioActual() usuario: any) { 
    return this.fincasService.obtenerFincasPorUsuario(usuario.fincaId);
  }
}