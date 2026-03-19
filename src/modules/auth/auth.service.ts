import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { FincasService } from '../fincas/fincas.service';
import * as bcrypt from 'bcrypt';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private fincasService: FincasService,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(identificador: string, contrasenaPlana: string): Promise<any> {
    // 1. Buscamos al usuario por teléfono o por username
    const usuario = await this.usuariosService.buscarPorIdentificador(identificador);
    
    if (!usuario) {
      return null;
    }

    // 2. Verificamos si la cuenta está bloqueada o eliminada
    if (usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Usuario inactivo o bloqueado');
    }

    // 3. Comparamos la contraseña encriptada usando bcrypt
    const esValida = await bcrypt.compare(contrasenaPlana, usuario.contrasena);
    
    if (esValida) {
      // Le quitamos la contraseña al objeto antes de devolverlo por seguridad
      const { contrasena, ...resultado } = usuario;
      return resultado;
    }
    
    return null;
  }

  async generarToken(usuario: any) {
    // 4. Creamos el "Carnet" (Payload) del usuario
    // ¡AQUÍ ESTÁ LA MAGIA SAAS! Guardamos el finca_id dentro del token
    const payload = { 
        sub: usuario.usuario_id, 
        telefono: usuario.telefono,
        rol: usuario.rol,
        fincaId: usuario.finca.finca_id // Relación que debe venir cargada
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.usuario_id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        finca: usuario.finca ? {  
          id: usuario.finca.finca_id,
          nombre: usuario.finca.nombre,
          ubicacion: usuario.finca.ubicacion
        } : null,
        debeCambiarContrasena: usuario.debe_cambiar_contrasena // Para forzar el cambio en el frontend
      }
    };
  }

  async registro(datos: RegistroDto) {
    const existe = await this.usuariosService.buscarPorTelefono(datos.telefono);

    if (existe) {
      throw new BadRequestException('El teléfono ya está registrado');
    }

    const finca = await this.fincasService.obtenerPorId(datos.fincaId);

    if (!finca) {
      throw new NotFoundException('La finca no existe');
    }


    const hashedPassword = await bcrypt.hash(datos.contrasena, 10);

    const nuevoUsuario = await this.usuariosService.crearUsuarioPublico({
      nombre: datos.nombre,
      telefono: datos.telefono,
      contrasena: hashedPassword,
      rol: datos.rol,
      fincaId: datos.fincaId,
    });
    // Genera el token después de crear el usuario
    const token = this.generarToken(nuevoUsuario);  
    return token;
  }
}