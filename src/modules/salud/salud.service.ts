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

  async actualizarTratamiento(id: number, datos: any, fincaId: number) {
    const tratamiento = await this.tratamientosRepo.findOne({
      where: { id, fincaId }
    });
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado o no pertenece a tu finca');

    return this.tratamientosRepo.update(id, datos);
  }

  async eliminarTratamiento(id: number, fincaId: number) {
    const tratamiento = await this.tratamientosRepo.findOne({
      where: { id, fincaId }
    });
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado o no pertenece a tu finca');

    return this.tratamientosRepo.softDelete(id);
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

  async actualizarVacuna(id: number, datos: any, fincaId: number) {
    const vacuna = await this.vacunasRepo.findOne({
      where: { id, fincaId }
    });
    if (!vacuna) throw new NotFoundException('Vacuna no encontrada o no pertenece a tu finca');

    return this.vacunasRepo.update(id, datos);
  }

  async eliminarVacuna(id: number, fincaId: number) {
    const vacuna = await this.vacunasRepo.findOne({
      where: { id, fincaId }
    });
    if (!vacuna) throw new NotFoundException('Vacuna no encontrada o no pertenece a tu finca');

    return this.vacunasRepo.softDelete(id);
  }
}