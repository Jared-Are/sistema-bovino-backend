import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion) private notificacionesRepo: Repository<Notificacion>,
  ) {}

  // Este método lo usarán otros servicios (Ej: SaludService) para disparar alertas automáticas
  async crearAlerta(usuarioId: string, titulo: string, mensaje: string, tipo: string, modulo: string) {
    const nueva = this.notificacionesRepo.create({
      usuario: { usuario_id: usuarioId },
      titulo,
      mensaje,
      tipo,
      modulo
    });
    return this.notificacionesRepo.save(nueva);
  }

  // Este método lo usará el frontend para mostrar la campanita de notificaciones
  async obtenerMisNotificaciones(usuarioId: string) {
    return this.notificacionesRepo.find({
      where: { usuario: { usuario_id: usuarioId } },
      order: { fecha_creacion: 'DESC' }
    });
  }

  // Para cuando el usuario hace clic en una notificación
  async marcarComoLeida(id: number, usuarioId: string) {
    const notificacion = await this.notificacionesRepo.findOne({
      where: { id, usuario: { usuario_id: usuarioId } }
    });
    
    if (notificacion) {
      notificacion.leida = true;
      return this.notificacionesRepo.save(notificacion);
    }
    return null;
  }
}