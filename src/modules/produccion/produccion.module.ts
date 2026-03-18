import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionService } from './produccion.service';
import { ProduccionController } from './produccion.controller';
import { ProduccionCarne } from './entities/produccion-carne.entity';
import { ProduccionLechera } from './entities/produccion-lechera.entity';

import { Animal } from '../animales/entities/animal.entity';

@Module({
  // Le avisamos a TypeORM que genere estas dos tablas en la base de datos
  imports: [TypeOrmModule.forFeature([ProduccionCarne, ProduccionLechera, Animal])],
  controllers: [ProduccionController],
  providers: [ProduccionService],
})
export class ProduccionModule {}