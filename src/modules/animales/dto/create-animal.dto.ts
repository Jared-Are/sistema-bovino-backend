import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { SexoAnimal, EstadoReproductivo } from '../../../common/enums';

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
  @Min(20)
  @Max(50)
  peso_nacimiento?: number;

  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(800)
  peso_actual?: number;

  @IsDateString()
  fecha_nacimiento: string;

  @IsDateString()
  @IsOptional()
  fecha_destete?: string;

  @IsNumber()
  @IsOptional()
  raza_id?: number;

  @IsNumber()
  @IsOptional()
  lote_id?: number;

  @IsNumber()
  @IsOptional()
  potrero_id?: number;

  @IsNumber()
  @IsOptional()
  animal_madre_id?: number;

  @IsNumber()
  @IsOptional()
  animal_padre_id?: number;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsEnum(EstadoReproductivo)
  @IsOptional()
  estado_reproductivo?: EstadoReproductivo;
}