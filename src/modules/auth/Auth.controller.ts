import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { identificador: string; contrasena: string }) {
    if (!body.identificador || !body.contrasena) {
      throw new UnauthorizedException('Faltan credenciales');
    }

    const user = await this.authService.validarUsuario(body.identificador, body.contrasena);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.authService.generarToken(user);
  }
}