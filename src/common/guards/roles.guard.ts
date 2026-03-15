import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolUsuario } from '../enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si no tiene el decorador @Roles, la ruta solo requiere JwtAuthGuard por defecto
    if (!requiredRoles) {
      return true; // Permitimos acceso general si no hay un rol específico requerido
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Verificamos si existe el usuario (JwtAuthGuard debió haberlo inyectado)
    if (!user || !user.rol) {
      throw new ForbiddenException('Usuario no autenticado correctamente o sin rol asignado.');
    }

    // Verificamos si el rol del usuario actual está en la lista de permitidos
    const hasRole = requiredRoles.includes(user.rol);
    
    if (!hasRole) {
       throw new ForbiddenException('No tienes el rol necesario para realizar esta acción en tu finca.');
    }

    return true;
  }
}
