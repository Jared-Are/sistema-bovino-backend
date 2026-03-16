import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalDto } from './create-animal.dto';
import { IsOptional, IsNumber, Min, Max, IsDateString, IsString } from 'class-validator';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(800)
  peso_actual?: number;

  @IsDateString()
  @IsOptional()
  fecha_destete?: string;

  @IsString()
  @IsOptional()
  estado_reproductivo?: string;
}