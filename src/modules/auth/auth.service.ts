import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { FincasService } from '../fincas/fincas.service';
import * as bcrypt from 'bcrypt';
import { RegistroDto } from './dto/registro.dto';
import { EmailService } from '../email/email.service';
import { EstadoUsuario } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private fincasService: FincasService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(identificador: string, contrasenaPlana: string): Promise<any> {
  const usuario = await this.usuariosService.buscarPorIdentificador(identificador);
  
  if (!usuario) {
    return null;
  }

  // Verificar si la cuenta está bloqueada
  if (usuario.estado === 'BLOQUEADO') {
    throw new UnauthorizedException('Usuario bloqueado');
  }

  const esValida = await bcrypt.compare(contrasenaPlana, usuario.contrasena);
  
  if (esValida) {
    // Si el usuario es INVITADO y hace login exitoso, actualizar a ACTIVO
    if (usuario.estado === 'INVITADO') {
      await this.usuariosService.actualizarEstado(usuario.usuario_id, EstadoUsuario.ACTIVO);
    }
    
    const { contrasena, ...resultado } = usuario;
    return resultado;
  }
  
  return null;
}

    async generarToken(usuario: any) {
    const payload = { 
        sub: usuario.usuario_id, 
        telefono: usuario.telefono,
        rol: usuario.rol,
        fincaId: usuario.finca?.finca_id,
        nombre: usuario.nombre
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        email: usuario.email,
        rol: usuario.rol,
        fincaId: usuario.finca?.finca_id,
        finca: usuario.finca ? {  
          finca_id: usuario.finca.finca_id,
          nombre: usuario.finca.nombre,
          ubicacion: usuario.finca.ubicacion
        } : null,
        debe_cambiar_contrasena: usuario.debe_cambiar_contrasena
      }
    };
  }

  async registro(datos: RegistroDto) {
    // Verificar si el teléfono ya existe
    const existe = await this.usuariosService.buscarPorTelefono(datos.telefono);
    if (existe) {
      throw new BadRequestException('Este número de teléfono ya está registrado con una finca');
    }

    // Verificar que la finca existe
    const finca = await this.fincasService.obtenerPorId(datos.fincaId);
    if (!finca) {
      throw new NotFoundException('La finca no existe');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(datos.contrasena, 10);

    // Crear usuario
    const nuevoUsuario = await this.usuariosService.crearUsuarioPublico({
      nombre: datos.nombre,
      telefono: datos.telefono,
      email: datos.email,
      contrasena: hashedPassword,
      rol: datos.rol,
      fincaId: datos.fincaId,
    });

    // Enviar credenciales por email si se proporcionó
    if (datos.email) {
      await this.emailService.enviarCredenciales(
        datos.email,
        datos.nombre,
        datos.telefono,
        datos.contrasena,
        datos.rol,
        finca.nombre,
      );
    }

    return this.generarToken(nuevoUsuario);
  }
}