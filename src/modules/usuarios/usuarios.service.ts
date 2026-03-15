import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  // Busca al usuario por teléfono e incluye la contraseña oculta de forma segura
  async buscarPorIdentificador(identificador: string): Promise<Usuario | null> {
    return this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.finca', 'finca') // Traemos la relación (SaaS)
      .where('usuario.telefono = :telefono', { telefono: identificador })
      .addSelect('usuario.contrasena') // Obligamos a traer la contraseña oculta para poder compararla con Bcrypt
      .getOne();
  }

  // NUEVO: Método para crear usuarios encriptando la contraseña (Excelente para Testing)
  async crearUsuario(datos: Partial<Usuario>, fincaId: number): Promise<Usuario> {
    // 1. Verificamos que el teléfono no exista ya en la base de datos
    const existe = await this.usuarioRepository.findOne({ where: { telefono: datos.telefono } });
    if (existe) {
      throw new BadRequestException('El teléfono ya está registrado en el sistema.');
    }

    // 2. Encriptamos la contraseña (si no mandan una, usamos 'Finca1234' por defecto)
    const contrasenaPlana = datos.contrasena || 'Finca1234';
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasenaPlana, salt);

    // 3. Creamos el usuario en memoria
    const nuevoUsuario = this.usuarioRepository.create({
      ...datos,
      contrasena: contrasenaEncriptada,
      finca: { finca_id: fincaId }, // Vinculamos al usuario con su Finca (Multi-Tenant)
      debe_cambiar_contrasena: true // Forzamos el cambio en el primer login
    });

    // 4. Guardamos en base de datos
    return this.usuarioRepository.save(nuevoUsuario);
  }

  async obtenerUsuariosDeFinca(fincaId: number) {
    return this.usuarioRepository.find({
      where: { finca: { finca_id: fincaId } },
      select: ['usuario_id', 'telefono', 'rol', 'estado', 'fecha_creacion'] // Ocultamos la contraseña
    });
  }

  // NUEVO: Método para cambiar la contraseña obligatoria en el primer login
  async cambiarContrasenaInicial(usuarioId: string, nuevaContrasena: string): Promise<boolean> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_id: usuarioId });
    
    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (!usuario.debe_cambiar_contrasena) {
      throw new BadRequestException('El usuario ya ha cambiado su contraseña inicial');
    }

    const salt = await bcrypt.genSalt(10);
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, salt);
    usuario.debe_cambiar_contrasena = false;
    
    await this.usuarioRepository.save(usuario);
    return true;
  }
}