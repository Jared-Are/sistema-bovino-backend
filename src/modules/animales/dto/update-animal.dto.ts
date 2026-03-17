import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalDto } from './create-animal.dto';
import { IsOptional, IsNumber, IsEnum, Min, Max, IsDateString, IsString } from 'class-validator';
import { EstadoReproductivo } from 'src/common/enums';
export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
 
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(800)
  peso_actual?: number;

  @IsDateString()
  @IsOptional()
  fecha_destete?: string;

  @IsEnum(EstadoReproductivo)
  @IsOptional()
  estado_reproductivo?: EstadoReproductivo;

  @IsNumber()
  @IsOptional()
  lote_id?: number;

  @IsNumber()
  @IsOptional()
  potrero_id?: number;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsNumber()
  @IsOptional()
  animal_madre_id?: number;

  @IsNumber()
  @IsOptional()
  animal_padre_id?: number;

  @IsNumber()
  @IsOptional()
  raza_id?: number;
}