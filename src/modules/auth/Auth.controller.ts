import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { LoginDto } from './dto/login.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';

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

  // NUEVO: Ruta protegida para forzar el cambio de contraseña
  @Post('cambiar-contrasena')
  @UseGuards(JwtAuthGuard) // NO requiere RolesGuard, pues todos deben poder cambiarla
  async cambiarContrasena(
    @Body() body: CambiarContrasenaDto,
    @UsuarioActual() tokenInfo: any
  ) {
    await this.authService.cambiarContrasena(tokenInfo.userId, body.nuevaContrasena);
    
    return {
      mensaje: 'Contraseña actualizada exitosamente. Por favor vuelve a iniciar sesión.'
    };
  }
}