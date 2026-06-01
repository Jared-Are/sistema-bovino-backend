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

  async buscarPorIdentificador(identificador: string): Promise<Usuario | null> {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca')
      .where('usuario.telefono = :telefono', { telefono: identificador })
      .orWhere('usuario.email = :email', { email: identificador })
      .andWhere('usuario.fecha_eliminacion IS NULL')
      .addSelect('usuario.contrasena')
      .getOne();
  }

  async buscarPorTelefono(telefono: string) {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca')
      .where('usuario.telefono = :telefono', { telefono })
      .andWhere('usuario.fecha_eliminacion IS NULL')
      .getOne();
  }

  async buscarPorId(id: string) {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca')
      .where('usuario.usuario_id = :id', { id })
      .andWhere('usuario.fecha_eliminacion IS NULL')
      .getOne();
  }

  async crearUsuarioPublico(datos: {
    nombre: string;
    telefono: string;
    email?: string;
    contrasena: string;
    rol: string;
    fincaId: number;
  }) {
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: datos.nombre,
      telefono: datos.telefono,
      email: datos.email || '',
      contrasena: datos.contrasena,
      rol: datos.rol as RolUsuario,
      finca: { finca_id: datos.fincaId } as any,
      estado: EstadoUsuario.ACTIVO,
      debe_cambiar_contrasena: true
    });

    return this.usuarioRepository.save(nuevoUsuario);
  }

  async cambiarContrasena(usuarioId: string, nuevaContrasena: string) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .where('usuario.usuario_id = :usuarioId', { usuarioId })
      .getOne();

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.contrasena) {
      const esMismaContrasena = await bcrypt.compare(nuevaContrasena, usuario.contrasena);
      if (esMismaContrasena) {
        throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
      }
    }
    
    if (nuevaContrasena.length < 6) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);
    
    await this.usuarioRepository.update(
      { usuario_id: usuarioId },
      { 
        contrasena: hashedPassword,
        debe_cambiar_contrasena: false
      }
    );
    
    return { 
      mensaje: 'Contraseña actualizada correctamente',
      debe_cambiar_contrasena: false 
    };
  }

  async crearUsuario(datos: CrearUsuarioDto, fincaId: number): Promise<any> {
    if (datos.rol === RolUsuario.PROPIETARIO) {
      const propietarioExistente = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoin('usuario.finca', 'finca')
        .where('finca.finca_id = :fincaId', { fincaId })
        .andWhere('usuario.rol = :rol', { rol: RolUsuario.PROPIETARIO })
        .andWhere('usuario.fecha_eliminacion IS NULL')
        .getOne();
        
      if (propietarioExistente) {
        throw new BadRequestException('Ya existe un propietario en esta finca');
      }
    }

    const telefonoExistente = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .where('usuario.telefono = :telefono', { telefono: datos.telefono })
      .andWhere('usuario.fecha_eliminacion IS NULL')
      .getOne();
      
    if (telefonoExistente) {
      throw new BadRequestException('El teléfono ya está registrado');
    }

    if (datos.email) {
      const emailExistente = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .where('usuario.email = :email', { email: datos.email })
        .andWhere('usuario.fecha_eliminacion IS NULL')
        .getOne();
        
      if (emailExistente) {
        throw new BadRequestException('El email ya está registrado');
      }
    }

    let contrasenaPlana = datos.contrasena;
    if (!contrasenaPlana) {
      contrasenaPlana = this.generarContrasenaTemporal();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasenaPlana, salt);

    const usuarioGuardado = await this.usuarioRepository.save({
      nombre: datos.nombre,
      telefono: datos.telefono,
      email: datos.email,
      contrasena: hashedPassword,
      rol: datos.rol,
      finca: { finca_id: fincaId },
      estado: EstadoUsuario.INVITADO, 
      debe_cambiar_contrasena: true
    });

    const finca = await this.usuarioRepository.manager
      .getRepository('finca')
      .findOne({ where: { finca_id: fincaId } });

    const { contrasena, ...resultado } = usuarioGuardado;

    let emailEnviado = false;
    if (datos.email) {
      try {
        await this.emailService.enviarCredenciales(
          datos.email,
          datos.nombre,
          datos.telefono,
          contrasenaPlana,
          datos.rol,
          finca?.nombre || 'Tu finca',
        );
        emailEnviado = true;
      } catch (emailError) {
        console.warn(`[UsuariosService] No se pudo enviar email a ${datos.email}:`, emailError);
      }
    }

    return { ...resultado, emailEnviado };
  }

  async obtenerUsuariosDeFinca(fincaId: number) {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca')
      .where('finca.finca_id = :fincaId', { fincaId })
      .andWhere('usuario.fecha_eliminacion IS NULL')
      .select([
        'usuario.usuario_id',
        'usuario.nombre',
        'usuario.email',
        'usuario.telefono',
        'usuario.rol',
        'usuario.estado',
        'usuario.fecha_creacion',
        'usuario.debe_cambiar_contrasena'
      ])
      .orderBy('usuario.nombre', 'ASC')
      .getMany();
  }

  async obtenerUsuarioPorId(usuarioId: string, fincaId: number) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca')
      .where('usuario.usuario_id = :usuarioId', { usuarioId })
      .andWhere('finca.finca_id = :fincaId', { fincaId })
      .andWhere('usuario.fecha_eliminacion IS NULL')
      .select([
        'usuario.usuario_id',
        'usuario.nombre',
        'usuario.email',
        'usuario.telefono',
        'usuario.rol',
        'usuario.estado',
        'usuario.fecha_creacion',
        'usuario.debe_cambiar_contrasena'
      ])
      .getOne();

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async actualizarUsuario(usuarioId: string, datos: ActualizarUsuarioDto, fincaId: number) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca')
      .where('usuario.usuario_id = :usuarioId', { usuarioId })
      .andWhere('finca.finca_id = :fincaId', { fincaId })
      .andWhere('usuario.fecha_eliminacion IS NULL')
      .getOne();

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const nombreFinca = usuario.finca?.nombre || 'Tu finca';
    const nombreUsuario = usuario.nombre;
    let emailCambiado = false;

    if (datos.telefono && datos.telefono !== usuario.telefono) {
      const telefonoExistente = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .where('usuario.telefono = :telefono', { telefono: datos.telefono })
        .andWhere('usuario.fecha_eliminacion IS NULL')
        .andWhere('usuario.usuario_id != :usuarioId', { usuarioId })
        .getOne();
        
      if (telefonoExistente) {
        throw new BadRequestException('El teléfono ya está registrado');
      }
    }

    if (datos.email && datos.email !== usuario.email) {
      const emailExistente = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .where('usuario.email = :email', { email: datos.email })
        .andWhere('usuario.fecha_eliminacion IS NULL')
        .andWhere('usuario.usuario_id != :usuarioId', { usuarioId })
        .getOne();
        
      if (emailExistente) {
        throw new BadRequestException('El email ya está registrado');
      }
      emailCambiado = true;
    }

    if (datos.estado) {
      if (![EstadoUsuario.ACTIVO, EstadoUsuario.BLOQUEADO].includes(datos.estado)) {
        throw new BadRequestException('El estado solo puede ser ACTIVO o BLOQUEADO');
      }
      if (usuario.estado === EstadoUsuario.INVITADO) {
        throw new BadRequestException('No se puede cambiar el estado de un usuario invitado manualmente');
      }
    }

    if (datos.rol && datos.rol !== usuario.rol) {
      if (usuario.rol === RolUsuario.PROPIETARIO) {
        throw new BadRequestException('No se puede cambiar el rol del propietario');
      }
    }
    
    Object.assign(usuario, datos);
    const usuarioActualizado = await this.usuarioRepository.save(usuario);

    if (emailCambiado && datos.email) {
      try {
        await this.emailService.notificarCambioEmail(
          datos.email,
          nombreUsuario,
          nombreFinca
        );
      } catch (emailError) {
        console.error('Error al enviar notificación de cambio de email:', emailError);
      }
    }

    const { contrasena, ...resultado } = usuarioActualizado;
    return resultado;
  }

  async eliminarUsuario(usuarioId: string, fincaId: number) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoin('usuario.finca', 'finca')
      .where('usuario.usuario_id = :usuarioId', { usuarioId })
      .andWhere('finca.finca_id = :fincaId', { fincaId })
      .andWhere('usuario.fecha_eliminacion IS NULL')
      .getOne();

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.rol === RolUsuario.PROPIETARIO) {
      const propietarios = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoin('usuario.finca', 'finca')
        .where('finca.finca_id = :fincaId', { fincaId })
        .andWhere('usuario.rol = :rol', { rol: RolUsuario.PROPIETARIO })
        .andWhere('usuario.fecha_eliminacion IS NULL')
        .getCount();

      if (propietarios <= 1) {
        throw new BadRequestException('No se puede eliminar el único propietario de la finca');
      }
    }

    await this.usuarioRepository.softDelete(usuarioId);
    return { message: 'Usuario eliminado correctamente' };
  }

  async actualizarEstado(usuarioId: string, nuevoEstado: EstadoUsuario) {
    await this.usuarioRepository.update(
      { usuario_id: usuarioId },
      { estado: nuevoEstado }
    );
  }

  private generarContrasenaTemporal(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let contrasena = '';
    for (let i = 0; i < 8; i++) {
      contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contrasena;
  }
}