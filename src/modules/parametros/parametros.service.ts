import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm'; 
import { Raza } from './entities/raza.entity';
import { Lote } from './entities/lote.entity';
import { Potrero } from './entities/potrero.entity';

@Injectable()
export class ParametrosService {
  constructor(
    @InjectRepository(Raza) private razaRepo: Repository<Raza>,
    @InjectRepository(Lote) private loteRepo: Repository<Lote>,
    @InjectRepository(Potrero) private potreroRepo: Repository<Potrero>,
  ) {}

  // --- RAZAS ---
  async createRaza(datos: { nombre: string; descripcion?: string }, fincaId: number) {
    const nuevaRaza = this.razaRepo.create({
      ...datos,
      finca: { finca_id: fincaId },
      fecha_eliminacion: null 
    });
    return this.razaRepo.save(nuevaRaza);
  }

  async findAllRazas(fincaId: number) {
    return this.razaRepo.find({
      where: { 
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull() 
      }
    });
  }

  async findOneRaza(id: number, fincaId: number) {
    const raza = await this.razaRepo.findOne({
      where: { 
        raza_id: id, 
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull() 
      }
    });
    if (!raza) {
      throw new NotFoundException(`Raza con ID ${id} no encontrada en tu finca`);
    }
    return raza;
  }

  async updateRaza(id: number, datos: any, fincaId: number) {
    const raza = await this.findOneRaza(id, fincaId);
    this.razaRepo.merge(raza, datos);
    return this.razaRepo.save(raza);
  }

  async removeRaza(id: number, fincaId: number) {
    const raza = await this.findOneRaza(id, fincaId);
    raza.fecha_eliminacion = new Date();
    return this.razaRepo.save(raza);
  }

  // --- LOTES ---
  async createLote(datos: { nombre: string }, fincaId: number) {
    const nuevoLote = this.loteRepo.create({
      ...datos,
      finca: { finca_id: fincaId },
      fecha_eliminacion: null
    });
    return this.loteRepo.save(nuevoLote);
  }

  async findAllLotes(fincaId: number) {
    return this.loteRepo.find({
      where: { 
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull()
      }
    });
  }

  async findOneLote(id: number, fincaId: number) {
    const lote = await this.loteRepo.findOne({
      where: { 
        lote_id: id, 
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull()
      }
    });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado en tu finca`);
    }
    return lote;
  }

  async updateLote(id: number, datos: any, fincaId: number) {
    const lote = await this.findOneLote(id, fincaId);
    this.loteRepo.merge(lote, datos);
    return this.loteRepo.save(lote);
  }

  async removeLote(id: number, fincaId: number) {
    const lote = await this.findOneLote(id, fincaId);
    lote.fecha_eliminacion = new Date(); 
    return this.loteRepo.save(lote);
  }

  // --- POTREROS ---
  async createPotrero(datos: { nombre: string; ubicacion?: string }, fincaId: number) {
    const nuevoPotrero = this.potreroRepo.create({
      ...datos,
      finca: { finca_id: fincaId },
      fecha_eliminacion: null
    });
    return this.potreroRepo.save(nuevoPotrero);
  }

  async findAllPotreros(fincaId: number) {
    return this.potreroRepo.find({
      where: { 
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull()
      }
    });
  }

  async findOnePotrero(id: number, fincaId: number) {
    const potrero = await this.potreroRepo.findOne({
      where: { 
        potrero_id: id, 
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull()
      }
    });
    if (!potrero) {
      throw new NotFoundException(`Potrero con ID ${id} no encontrado en tu finca`);
    }
    return potrero;
  }

  async updatePotrero(id: number, datos: any, fincaId: number) {
    const potrero = await this.findOnePotrero(id, fincaId);
    this.potreroRepo.merge(potrero, datos);
    return this.potreroRepo.save(potrero);
  }

  async removePotrero(id: number, fincaId: number) {
    const potrero = await this.findOnePotrero(id, fincaId);
    potrero.fecha_eliminacion = new Date(); 
    return this.potreroRepo.save(potrero);
  }
}