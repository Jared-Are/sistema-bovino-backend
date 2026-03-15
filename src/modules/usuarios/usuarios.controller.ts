import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard) // 🛡️ Todo bloqueado
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Solo el propietario puede crear nuevos usuarios (trabajadores)
  @Post()
  @Roles(RolUsuario.PROPIETARIO)
  crearUsuario(@Body() body: CrearUsuarioDto, @UsuarioActual() usuario: any) {
    // Forzamos a que el nuevo usuario se cree en la misma finca del creador
    return this.usuariosService.crearUsuario(body, usuario.fincaId);
  }

  // Lista todos los usuarios de la finca para poder administrarlos
  @Get()
  @Roles(RolUsuario.PROPIETARIO)
  obtenerUsuarios(@UsuarioActual() usuario: any) {
    return this.usuariosService.obtenerUsuariosDeFinca(usuario.fincaId);
  }
}