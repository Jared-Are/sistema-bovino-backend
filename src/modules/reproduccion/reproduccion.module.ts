import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReproduccionService } from './reproduccion.service';
import { ReproduccionController } from './reproduccion.controller';
import { Monta } from './entities/monta.entity';
import { DiagnosticoPrenez } from './entities/diagnostico-prenez.entity';
import { Parto } from './entities/parto.entity';
import { Animal } from '../animales/entities/animal.entity'; // <-- IMPORTANTE: Importar entidad Animal
import { NotificacionesModule } from '../notificaciones/notificaciones.module'; // <-- IMPORTANTE: Importar módulo

@Module({
  imports: [
    // Le decimos a TypeORM que este módulo usará estas 4 tablas
    TypeOrmModule.forFeature([Monta, DiagnosticoPrenez, Parto, Animal]), 
    // Importamos el módulo de notificaciones para poder usar su servicio
    NotificacionesModule,
  ],
  controllers: [ReproduccionController],
  providers: [ReproduccionService],
})
export class ReproduccionModule {}