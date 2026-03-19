import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async buscarPorIdentificador(identificador: string): Promise<Usuario | null> {
    return this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca')
      .where('usuario.telefono = :telefono', { telefono: identificador })
      .addSelect('usuario.contrasena')
      .getOne();
  }

// En crearUsuario() - AGREGAR al inicio:
  async crearUsuario(datos: CrearUsuarioDto, fincaId: number): Promise<Usuario> {
  if (datos.rol === RolUsuario.PROPIETARIO) {
    const propietarioExistente = await this.usuarioRepository.findOne({
      where: { finca: { finca_id: fincaId }, rol: RolUsuario.PROPIETARIO }
    });
    if (propietarioExistente) {
      throw new BadRequestException('Ya existe un propietario en esta finca');
    }
  }

  // ... resto del código igual
  const nuevoUsuario = this.usuarioRepository.create({
    ...datos,
    finca: { finca_id: fincaId },
    debe_cambiar_contrasena: true
  });

  return this.usuarioRepository.save(nuevoUsuario);
}

  // Lista COMPLETA con finca
  async obtenerUsuariosDeFinca(fincaId: number) {
    return this.usuarioRepository.find({
      where: { finca: { finca_id: fincaId } },
      relations: ['finca', 'rol'], // Trae relaciones
      select: [
        'usuario_id', 'nombre', 'email', 'telefono', 
        'rol', 'estado', 'fecha_creacion', 'debe_cambiar_contrasena'
      ]
    });
  }

  // usuario por ID
  async obtenerUsuarioPorId(usuarioId: string, fincaId: number) {
  const usuario = await this.usuarioRepository.findOne({
    where: { 
      usuario_id: usuarioId,
      finca: { finca_id: fincaId }
    },
    relations: ['finca']
  });

  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }

  usuario.finca = usuario.finca.nombre || 'Sin finca';
  
  return usuario;
  }

  // Actualizar usuario
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

    // Actualiza solo campos enviados
    Object.assign(usuario, datos);
    
    return this.usuarioRepository.save(usuario);
  }

  // Eliminar usuario
  async eliminarUsuario(usuarioId: string, fincaId: number) {
    const resultado = await this.usuarioRepository.delete({
      usuario_id: usuarioId,
      finca: { finca_id: fincaId }
    });

    if (resultado.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { message: 'Usuario eliminado correctamente' };
  }

  async cambiarContrasenaInicial(usuarioId: string, nuevaContrasena: string): Promise<boolean> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_id: usuarioId });
    
    if (!usuario || !usuario.debe_cambiar_contrasena) {
      throw new BadRequestException('Usuario no válido o ya cambió contraseña');
    }

    const salt = await bcrypt.genSalt(10);
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, salt);
    usuario.debe_cambiar_contrasena = false;
    
    await this.usuarioRepository.save(usuario);
    return true;
  }
}