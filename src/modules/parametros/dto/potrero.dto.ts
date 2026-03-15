import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CrearPotreroDto {
  @IsString({ message: 'El nombre del potrero debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del potrero es obligatorio' })
  nombre: string;

  @IsString({ message: 'La ubicación debe ser texto' })
  @IsOptional()
  ubicacion?: string;
}

export class ActualizarPotreroDto extends PartialType(CrearPotreroDto) {}
