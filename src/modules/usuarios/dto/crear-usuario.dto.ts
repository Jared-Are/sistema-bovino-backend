import { IsString, IsNotEmpty, IsEnum, IsOptional, MinLength, Matches } from 'class-validator';
import { RolUsuario } from '../../../common/enums';

export class CrearUsuarioDto {
  @IsString({ message: 'El teléfono debe ser texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'El teléfono debe contener entre 8 y 15 números, y puede incluir un signo + al inicio' })
  telefono: string;

  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEnum(RolUsuario, { message: 'El rol debe ser PROPIETARIO, VETERINARIO u OPERARIO' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  rol: RolUsuario;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena?: string;
}
