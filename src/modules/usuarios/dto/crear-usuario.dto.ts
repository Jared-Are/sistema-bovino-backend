import { IsString, IsNotEmpty, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { RolUsuario } from '../../../common/enums';

export class CrearUsuarioDto {
  @IsString({ message: 'El teléfono debe ser texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MinLength(10, { message: 'El número de teléfono debe tener al menos 10 caracteres' })
  @MaxLength(15, { message: 'El número de teléfono no debe exceder los 15 caracteres' })
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
