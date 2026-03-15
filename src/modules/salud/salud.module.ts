import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaludService } from './salud.service';
import { SaludController } from './salud.controller';
import { Tratamiento } from './entities/tratamiento.entity';
import { Vacuna } from './entities/vacuna.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tratamiento, Vacuna])], // <-- Le avisamos a TypeORM de las nuevas tablas
  controllers: [SaludController],
  providers: [SaludService],
})
export class SaludModule {}