import { Controller, Post, Body, Get, UseGuards, Param, Patch, Delete, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
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

  @Post()
  @Roles(RolUsuario.PROPIETARIO)
  crearUsuario(@Body() body: CrearUsuarioDto, @UsuarioActual() usuario: any) {
    return this.usuariosService.crearUsuario(body, usuario.fincaId);
  }

  @Get()
  @Roles(RolUsuario.PROPIETARIO)
  obtenerUsuarios(@UsuarioActual() usuario: any) {
    return this.usuariosService.obtenerUsuariosDeFinca(usuario.fincaId);
  }

  @Get(':id')
  @Roles(RolUsuario.PROPIETARIO)
  async obtenerUsuario(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: any) {
    return this.usuariosService.obtenerUsuarioPorId(id, usuario.fincaId);
  }

  @Patch(':id')
  @Roles(RolUsuario.PROPIETARIO)
  async actualizarUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: ActualizarUsuarioDto,
    @UsuarioActual() usuario: any
  ) {
    return this.usuariosService.actualizarUsuario(id, datos, usuario.fincaId);
  }

  @Delete(':id')
  @Roles(RolUsuario.PROPIETARIO)
  async eliminarUsuario(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: any) {
    return this.usuariosService.eliminarUsuario(id, usuario.fincaId);
  }

  @Post('cambiar-contrasena')
  @UseGuards(JwtAuthGuard)
  async cambiarContrasena(
    @UsuarioActual() usuario: any,
    @Body('nuevaContrasena') nuevaContrasena: string
  ) {
    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 6 caracteres');
    }
    
    const resultado = await this.usuariosService.cambiarContrasena(usuario.usuarioId, nuevaContrasena);    
    return resultado;
  }
}