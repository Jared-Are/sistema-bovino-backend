import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CrearRazaDto {
  @IsString({ message: 'El nombre de la raza debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de la raza es obligatorio' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser texto' })
  @IsOptional()
  descripcion?: string;
}

export class ActualizarRazaDto extends PartialType(CrearRazaDto) {}
