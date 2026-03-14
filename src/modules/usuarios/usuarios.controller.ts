import { Controller, Post, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Endpoint: POST /usuarios
 @Post()
  crearUsuario(@Body() body: any) {
    // Si Postman envía un fincaId, lo usa. Si no, lo manda a la finca 1 por defecto.
    const fincaId = body.fincaId || 1; 
    return this.usuariosService.crearUsuario(body, fincaId);
  }
}