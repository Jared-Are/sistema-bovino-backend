import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaludService } from './salud.service';
import { SaludController } from './salud.controller';
import { Tratamiento } from './entities/tratamiento.entity';
import { TipoTratamiento } from './entities/tipo-tratamiento.entity';
import { Animal } from '../animales/entities/animal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tratamiento, TipoTratamiento, Animal]), 
  ],
  controllers: [SaludController],
  providers: [SaludService],
  exports: [SaludService],
})
export class SaludModule {}