import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduccionCarne } from './entities/produccion-carne.entity';
import { ProduccionLechera } from './entities/produccion-lechera.entity';

@Injectable()
export class ProduccionService {
  constructor(
    @InjectRepository(ProduccionCarne) private produccionCarneRepo: Repository<ProduccionCarne>,
    @InjectRepository(ProduccionLechera) private produccionLecheraRepo: Repository<ProduccionLechera>,
  ) {}

  // =====================================
  // PRODUCCIÓN LECHERA
  // =====================================
  async registrarLeche(datos: any, fincaId: number) {
    const nueva = this.produccionLecheraRepo.create({
      ...datos,
      fincaId,
      animal: { animal_id: datos.animalId } // Relacionamos con la vaca ordeñada
    });
    return this.produccionLecheraRepo.save(nueva);
  }

  async obtenerLeche(fincaId: number) {
    return this.produccionLecheraRepo.find({
      where: { fincaId },
      relations: ['animal'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async actualizarLeche(id: number, datos: any, fincaId: number) {
    const registro = await this.produccionLecheraRepo.findOne({
      where: { id, fincaId }
    });
    if (!registro) throw new NotFoundException('Registro de leche no encontrado o no pertenece a tu finca');

    return this.produccionLecheraRepo.update(id, datos);
  }

  async eliminarLeche(id: number, fincaId: number) {
    const registro = await this.produccionLecheraRepo.findOne({
      where: { id, fincaId }
    });
    if (!registro) throw new NotFoundException('Registro de leche no encontrado o no pertenece a tu finca');

    return this.produccionLecheraRepo.softDelete(id);
  }

  // =====================================
  // PRODUCCIÓN DE CARNE
  // =====================================
  async registrarCarne(datos: any, fincaId: number) {
    const nueva = this.produccionCarneRepo.create({
      ...datos,
      fincaId,
      animal: { animal_id: datos.animalId } // Relacionamos con el animal pesado/sacrificado
    });
    return this.produccionCarneRepo.save(nueva);
  }

  async obtenerCarne(fincaId: number) {
    return this.produccionCarneRepo.find({
      where: { fincaId },
      relations: ['animal'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async actualizarCarne(id: number, datos: any, fincaId: number) {
    const registro = await this.produccionCarneRepo.findOne({
      where: { id, fincaId }
    });
    if (!registro) throw new NotFoundException('Registro de carne no encontrado o no pertenece a tu finca');

    return this.produccionCarneRepo.update(id, datos);
  }

  async eliminarCarne(id: number, fincaId: number) {
    const registro = await this.produccionCarneRepo.findOne({
      where: { id, fincaId }
    });
    if (!registro) throw new NotFoundException('Registro de carne no encontrado o no pertenece a tu finca');

    return this.produccionCarneRepo.softDelete(id);
  }
}