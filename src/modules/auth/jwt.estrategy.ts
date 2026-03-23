import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'F1nc4_S3cr3t_K3y_2026',
    });
  }

  async validate(payload: any) {
    return { 
      usuarioId: payload.sub,  
      telefono: payload.telefono, 
      rol: payload.rol, 
      fincaId: payload.fincaId,
      nombre: payload.nombre
    };
  }
}