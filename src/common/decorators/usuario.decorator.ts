import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Este decorador mágico intercepta la petición, busca el Token desencriptado
// por nuestro JwtAuthGuard, y nos devuelve los datos del usuario.
export const UsuarioActual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; 
    // request.user contiene: { userId, telefono, rol, fincaId }
  },
);