import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { SexoAnimal } from '../../../common/enums';

export class CreateAnimalDto {
  @IsString()
  arete: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsEnum(SexoAnimal)
  sexo: SexoAnimal;

  @IsNumber()
  @IsOptional()
  peso_nacimiento?: number;

  @IsDateString()
  fecha_nacimiento: string;

  @IsNumber()
  fincaId: number;

  @IsNumber()
  razaId: number;

  @IsNumber()
  @IsOptional()
  loteId?: number;
}