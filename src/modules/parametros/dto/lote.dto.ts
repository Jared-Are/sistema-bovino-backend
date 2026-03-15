import { IsString, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CrearLoteDto {
  @IsString({ message: 'El nombre del lote debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del lote es obligatorio' })
  nombre: string;
}

export class ActualizarLoteDto extends PartialType(CrearLoteDto) {}
