import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Le decimos que busque el Token en los Headers (Bearer Token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Usamos la misma llave secreta que en el auth.module
      secretOrKey: configService.get<string>('JWT_SECRET') || 'F1nc4_S3cr3t_K3y_2026',
    });
  }

  // Si el token es válido y no está falsificado, NestJS ejecuta esto
  async validate(payload: any) {
    // Retornamos los datos desencriptados para que NestJS los ponga en el `request.user`
    return { 
        userId: payload.sub, 
        telefono: payload.telefono, 
        rol: payload.rol, 
        fincaId: payload.fincaId 
    };
  }
}