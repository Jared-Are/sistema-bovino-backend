import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validarUsuario(body.identificador, body.contrasena);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.authService.generarToken(user);
  }

  @Post('registro') 
  @HttpCode(HttpStatus.CREATED)
  async registro(@Body() body: RegistroDto) {
    return this.authService.registro(body);
  }
}