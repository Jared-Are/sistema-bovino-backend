import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard) // 🛡️ Todo bloqueado
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  obtenerMisNotificaciones(@UsuarioActual() usuario: any) {
    // El "userId" es extraído del Token JWT (el sub)
    return this.notificacionesService.obtenerMisNotificaciones(usuario.userId);
  }

  @Patch(':id/leer')
  marcarComoLeida(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.notificacionesService.marcarComoLeida(+id, usuario.userId);
  }
}