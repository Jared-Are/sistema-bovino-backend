import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tratamiento } from './entities/tratamiento.entity';
import { Vacuna } from './entities/vacuna.entity';

@Injectable()
export class SaludService {
  constructor(
    @InjectRepository(Tratamiento) private tratamientosRepo: Repository<Tratamiento>,
    @InjectRepository(Vacuna) private vacunasRepo: Repository<Vacuna>,
  ) {}

  // =====================================
  // TRATAMIENTOS
  // =====================================
  async crearTratamiento(datos: any, fincaId: number) {
    const nuevo = this.tratamientosRepo.create({
      ...datos,
      fincaId, // Aislamiento SaaS
      animal: { animal_id: datos.animalId } // Relacionamos con la vaca
    });
    return this.tratamientosRepo.save(nuevo);
  }

  async obtenerTratamientos(fincaId: number) {
    return this.tratamientosRepo.find({
      where: { fincaId },
      relations: ['animal'], // Trae los datos de la vaca enferma
      order: { fecha: 'DESC' } // Los más recientes primero
    });
  }

  // =====================================
  // VACUNAS
  // =====================================
  async registrarVacuna(datos: any, fincaId: number) {
    const nueva = this.vacunasRepo.create({
      ...datos,
      fincaId,
      animal: { animal_id: datos.animalId }
    });
    return this.vacunasRepo.save(nueva);
  }

  async obtenerVacunas(fincaId: number) {
    return this.vacunasRepo.find({
      where: { fincaId },
      relations: ['animal'],
      order: { fecha: 'DESC' }
    });
  }
}