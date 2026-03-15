import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { SexoAnimal } from '../../../common/enums';

export class CrearAnimalDto {
  @IsString({ message: 'El arete debe ser texto' })
  @IsNotEmpty({ message: 'El arete es obligatorio' })
  arete: string;

  @IsString({ message: 'El nombre debe ser texto' })
  @IsOptional()
  nombre?: string;

  @IsEnum(SexoAnimal, { message: 'El sexo debe ser MACHO o HEMBRA' })
  @IsNotEmpty({ message: 'El sexo es obligatorio' })
  sexo: SexoAnimal;

  @IsNumber({}, { message: 'El peso de nacimiento debe ser un número' })
  @IsNotEmpty({ message: 'El peso de nacimiento es obligatorio' })
  peso_nacimiento: number;

  @IsNumber({}, { message: 'El peso actual debe ser un número' })
  @IsOptional()
  peso_actual?: number;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida (ISO 8601)' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fecha_nacimiento: string;

  @IsDateString({}, { message: 'La fecha de destete debe ser una fecha válida (ISO 8601)' })
  @IsOptional()
  fecha_destete?: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsString()
  @IsOptional()
  estado_reproductivo?: string;

  // -- Identificadores de Relaciones (Se dejan opcionales para flexibilidad del Frontend)
  @IsOptional()
  raza?: any;

  @IsOptional()
  lote?: any;

  @IsOptional()
  potrero?: any;

  @IsOptional()
  madre?: any;

  @IsOptional()
  padre?: any;
}

export class ActualizarAnimalDto extends PartialType(CrearAnimalDto) {}
