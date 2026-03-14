import { Controller, Post, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Endpoint: POST /usuarios
  @Post()
  crearUsuario(@Body() body: Partial<Usuario>) {
    // Para empezar y poder hacer nuestras primeras pruebas, forzaremos 
    // que el usuario creado pertenezca a la Finca con ID 1.
    // Más adelante, en arquitectura SaaS, esto lo extraeremos del Token del Propietario.
    const fincaId = 1; 
    return this.usuariosService.crearUsuario(body, fincaId);
  }
}