import { IsString, IsNotEmpty, IsEnum, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { RolUsuario } from '../../../common/enums';

export class CrearUsuarioDto {
  @IsString({ message: 'El teléfono debe ser texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MinLength(8, { message: 'El número de teléfono debe tener al menos 8 caracteres' })
  @MaxLength(12, { message: 'El número de teléfono no debe exceder los 12 caracteres' })
  @Matches(/^\+?[0-9]+$/, { message: 'El teléfono solo puede contener números y un signo + al inicio' })
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
