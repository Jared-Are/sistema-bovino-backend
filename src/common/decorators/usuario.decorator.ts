import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UsuarioActual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    return {
      usuarioId: user?.usuarioId, 
      fincaId: user?.fincaId,
      rol: user?.rol,
      nombre: user?.nombre,
      telefono: user?.telefono
    };
  },
);