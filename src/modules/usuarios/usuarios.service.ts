import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { RolUsuario, EstadoUsuario } from '../../common/enums';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private emailService: EmailService,
  ) {}

  // ==================== MÉTODOS PARA AUTH ====================

  async buscarPorIdentificador(identificador: string): Promise<Usuario | null> {
    return this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca')
      .where('usuario.telefono = :telefono', { telefono: identificador })
      .orWhere('usuario.email = :email', { email: identificador })
      .addSelect('usuario.contrasena')
      .getOne();
  }

  async buscarPorTelefono(telefono: string) {
    return this.usuarioRepository.findOne({
      where: { telefono },
      relations: ['finca']
    });
  }

  async buscarPorId(id: string) {
    return this.usuarioRepository.findOne({
      where: { usuario_id: id },
      relations: ['finca']
    });
  }

  async crearUsuarioPublico(datos: {
    nombre: string;
    telefono: string;
    email?: string;
    contrasena: string;
    rol: string;
    fincaId: number;
  }) {
    const nuevoUsuario = new Usuario();
    nuevoUsuario.nombre = datos.nombre;
    nuevoUsuario.telefono = datos.telefono;
    nuevoUsuario.email = datos.email || '';
    nuevoUsuario.contrasena = datos.contrasena;
    nuevoUsuario.rol = datos.rol as RolUsuario;
    nuevoUsuario.finca = { finca_id: datos.fincaId } as any;
    nuevoUsuario.estado = EstadoUsuario.ACTIVO;
    nuevoUsuario.debe_cambiar_contrasena = true;

    return this.usuarioRepository.save(nuevoUsuario);
  }

  async cambiarContrasenaInicial(usuarioId: string, nuevaContrasena: string): Promise<boolean> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: usuarioId },
      select: ['usuario_id', 'debe_cambiar_contrasena', 'contrasena']
    });
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!usuario.debe_cambiar_contrasena) {
      throw new BadRequestException('El usuario ya cambió su contraseña inicial');
    }

    const salt = await bcrypt.genSalt(10);
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, salt);
    usuario.debe_cambiar_contrasena = false;
    
    await this.usuarioRepository.save(usuario);
    return true;
  }

  async actualizarContrasena(usuarioId: string, nuevaContrasena: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

    await this.usuarioRepository.update(
      { usuario_id: usuarioId },
      { 
        contrasena: hashedPassword,
        debe_cambiar_contrasena: false 
      }
    );
    
    return { mensaje: 'Contraseña actualizada correctamente' };
  }

  // ==================== CRUD PARA PROPIETARIO ====================

  async crearUsuario(datos: CrearUsuarioDto, fincaId: number): Promise<Usuario> {
    // Validar que no exista otro propietario en la finca
    if (datos.rol === RolUsuario.PROPIETARIO) {
      const propietarioExistente = await this.usuarioRepository.findOne({
        where: { finca: { finca_id: fincaId }, rol: RolUsuario.PROPIETARIO }
      });
      if (propietarioExistente) {
        throw new BadRequestException('Ya existe un propietario en esta finca');
      }
    }

    // Validar teléfono único
    const telefonoExistente = await this.usuarioRepository.findOne({
      where: { telefono: datos.telefono }
    });
    if (telefonoExistente) {
      throw new BadRequestException('El teléfono ya está registrado');
    }

    // Validar email único (si viene)
    if (datos.email) {
      const emailExistente = await this.usuarioRepository.findOne({
        where: { email: datos.email }
      });
      if (emailExistente) {
        throw new BadRequestException('El email ya está registrado');
      }
    }

    // Generar contraseña temporal si no viene
    let contrasenaPlana = datos.contrasena;
    if (!contrasenaPlana) {
      contrasenaPlana = this.generarContrasenaTemporal();
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasenaPlana, salt);

    // Crear usuario
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: datos.nombre,
      telefono: datos.telefono,
      email: datos.email,
      contrasena: hashedPassword,
      rol: datos.rol,
      finca: { finca_id: fincaId },
      estado: EstadoUsuario.INVITADO,
      debe_cambiar_contrasena: true
    });

    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

    // Obtener nombre de la finca para el email
    const finca = await this.usuarioRepository.manager
      .getRepository('finca')
      .findOne({ where: { finca_id: fincaId } });

    // Enviar credenciales por email (si tiene email)
    if (datos.email) {
      await this.emailService.enviarCredenciales(
        datos.email,
        datos.nombre,
        datos.telefono,
        contrasenaPlana,
        datos.rol,
        finca?.nombre || 'Tu finca',
      );
    }

    // No devolver la contraseña en la respuesta
    const { contrasena, ...resultado } = usuarioGuardado;
    return resultado as Usuario;
  }

  async obtenerUsuariosDeFinca(fincaId: number) {
    return this.usuarioRepository.find({
      where: { finca: { finca_id: fincaId } },
      relations: ['finca'],
      select: [
        'usuario_id', 
        'nombre', 
        'email', 
        'telefono', 
        'rol', 
        'estado', 
        'fecha_creacion', 
        'debe_cambiar_contrasena'
      ],
      order: { nombre: 'ASC' }
    });
  }

  async obtenerUsuarioPorId(usuarioId: string, fincaId: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { 
        usuario_id: usuarioId,
        finca: { finca_id: fincaId }
      },
      relations: ['finca'],
      select: [
        'usuario_id', 
        'nombre', 
        'email', 
        'telefono', 
        'rol', 
        'estado', 
        'fecha_creacion', 
        'debe_cambiar_contrasena'
      ]
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async actualizarUsuario(usuarioId: string, datos: ActualizarUsuarioDto, fincaId: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { 
        usuario_id: usuarioId,
        finca: { finca_id: fincaId }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar teléfono único si se actualiza
    if (datos.telefono && datos.telefono !== usuario.telefono) {
      const telefonoExistente = await this.usuarioRepository.findOne({
        where: { telefono: datos.telefono }
      });
      if (telefonoExistente) {
        throw new BadRequestException('El teléfono ya está registrado');
      }
    }

    // Validar email único si se actualiza
    if (datos.email && datos.email !== usuario.email) {
      const emailExistente = await this.usuarioRepository.findOne({
        where: { email: datos.email }
      });
      if (emailExistente) {
        throw new BadRequestException('El email ya está registrado');
      }
    }

    // Si se actualiza la contraseña, hashearla
    if (datos.contrasena) {
      const salt = await bcrypt.genSalt(10);
      datos.contrasena = await bcrypt.hash(datos.contrasena, salt);
    }

    // Actualizar solo campos enviados
    Object.assign(usuario, datos);
    
    const usuarioActualizado = await this.usuarioRepository.save(usuario);
    
    // No devolver la contraseña
    const { contrasena, ...resultado } = usuarioActualizado;
    return resultado;
  }

  async eliminarUsuario(usuarioId: string, fincaId: number) {
    // Verificar que no sea el único propietario
    const usuario = await this.usuarioRepository.findOne({
      where: { 
        usuario_id: usuarioId,
        finca: { finca_id: fincaId }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si es propietario, verificar que no sea el único
    if (usuario.rol === RolUsuario.PROPIETARIO) {
      const propietarios = await this.usuarioRepository.count({
        where: { 
          finca: { finca_id: fincaId }, 
          rol: RolUsuario.PROPIETARIO 
        }
      });

      if (propietarios <= 1) {
        throw new BadRequestException('No se puede eliminar el único propietario de la finca');
      }
    }

    const resultado = await this.usuarioRepository.delete({
      usuario_id: usuarioId,
      finca: { finca_id: fincaId }
    });

    if (resultado.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { message: 'Usuario eliminado correctamente' };
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private generarContrasenaTemporal(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let contrasena = '';
    for (let i = 0; i < 8; i++) {
      contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contrasena;
  }
  async actualizarEstado(usuarioId: string, nuevoEstado: EstadoUsuario) {
  await this.usuarioRepository.update(
    { usuario_id: usuarioId },
    { estado: nuevoEstado }
  );
}
}