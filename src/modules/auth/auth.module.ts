import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './Auth.controller'; // <-- Corregido a minúscula
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtStrategy } from './jwt.estrategy'; // <-- Importación correcta de la estrategia

@Module({
  imports: [
    UsuariosModule, // Necesitamos buscar usuarios
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // Usaremos una variable de entorno para el secreto JWT
        secret: configService.get<string>('JWT_SECRET') || 'F1nc4_S3cr3t_K3y_2026', 
        signOptions: { expiresIn: '12h' }, // El token expira en 12 horas
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy], // <-- ¡AQUÍ ESTÁ! Agregamos el guardia a los proveedores
  controllers: [AuthController],
})
export class AuthModule {}