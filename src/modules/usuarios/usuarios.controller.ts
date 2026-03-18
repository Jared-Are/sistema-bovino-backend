import { Controller, Post, Body, Get, UseGuards, Param, Patch, Delete, ParseUUIDPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  //Crear usuario
  @Post()
  @Roles(RolUsuario.PROPIETARIO)
  crearUsuario(@Body() body: CrearUsuarioDto, @UsuarioActual() usuario: any) {
    return this.usuariosService.crearUsuario(body, usuario.fincaId);
  }

  //Lista usuarios
  @Get()
  @Roles(RolUsuario.PROPIETARIO)
  obtenerUsuarios(@UsuarioActual() usuario: any) {
    return this.usuariosService.obtenerUsuariosDeFinca(usuario.fincaId);
  }

  // Obtener usuario por ID (para editar)
  @Get(':id')
  @Roles(RolUsuario.PROPIETARIO)
  async obtenerUsuario(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: any) {
    return this.usuariosService.obtenerUsuarioPorId(id, usuario.fincaId);
  }

  // Actualizar usuario
  @Patch(':id')
  @Roles(RolUsuario.PROPIETARIO)
  async actualizarUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: ActualizarUsuarioDto,
    @UsuarioActual() usuario: any
  ) {
    return this.usuariosService.actualizarUsuario(id, datos, usuario.fincaId);
  }

  // Eliminar usuario
  @Delete(':id')
  @Roles(RolUsuario.PROPIETARIO)
  async eliminarUsuario(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: any) {
    return this.usuariosService.eliminarUsuario(id, usuario.fincaId);
  }
}