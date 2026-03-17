import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// DTO PARA LECHE
export class RegistrarLecheDto {
  @IsString({ message: 'El número de producción debe ser texto' })
  @IsNotEmpty({ message: 'El número de producción es obligatorio' })
  numero_produccion: string;

  @IsNumber({}, { message: 'La cantidad (Litros) debe ser un número' })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  cantidad: number;

  @IsOptional()
  animal?: any;
}

export class ActualizarLecheDto extends PartialType(RegistrarLecheDto) {}

// DTO PARA CARNE
export class RegistrarCarneDto {
  @IsNumber({}, { message: 'El peso del canal debe ser un número' })
  @IsNotEmpty({ message: 'El peso del canal es obligatorio' })
  peso_canal: number;

  @IsOptional()
  animal?: any;
}

export class ActualizarCarneDto extends PartialType(RegistrarCarneDto) {}
