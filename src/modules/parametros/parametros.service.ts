import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raza } from './entities/raza.entity';
import { Lote } from './entities/lote.entity';
import { Potrero } from './entities/potrero.entity';

@Injectable()
export class ParametrosService {
  constructor(
    @InjectRepository(Raza) private razaRepo: Repository<Raza>,
    @InjectRepository(Lote) private loteRepo: Repository<Lote>,
    @InjectRepository(Potrero) private potreroRepo: Repository<Potrero>,
  ) { }

  async crearRaza(datos: any, fincaId: number) {
    return this.razaRepo.save({ ...datos, finca: { finca_id: fincaId } as any });
  }

  async obtenerRazas(fincaId: number) {
    return this.razaRepo.find({
        where: { finca: { finca_id: fincaId } }
    });
  }

  async actualizarRaza(id: number, datos: { nombre?: string; descripcion?: string }, fincaId: number) {
    const raza = await this.razaRepo.findOne({
        where: { raza_id: id, finca: { finca_id: fincaId } }
    });
    if (!raza) throw new Error('Raza no encontrada o no pertenece a tu finca');
    
    return this.razaRepo.update(id, datos);
  }

  async eliminarRaza(id: number, fincaId: number) {
    const raza = await this.razaRepo.findOne({
        where: { raza_id: id, finca: { finca_id: fincaId } }
    });
    if (!raza) throw new Error('Raza no encontrada o no pertenece a tu finca');

    return this.razaRepo.softDelete(id);
  }

  // --- LOTES ---
  async crearLote(datos: any, fincaId: number) {
    return this.loteRepo.save({ 
        ...datos, 
        finca: { finca_id: fincaId } as any 
    });
  }

  async obtenerLotes(fincaId: number) {
    return this.loteRepo.find({
        where: { finca: { finca_id: fincaId } }
    });
  }

  async actualizarLote(id: number, datos: any, fincaId: number) {
    // Primero verificamos que pertenezca a la finca
    const lote = await this.loteRepo.findOne({
        where: { lote_id: id, finca: { finca_id: fincaId } }
    });
    if (!lote) throw new Error('Lote no encontrado o no pertenece a tu finca');
    
    return this.loteRepo.update(id, datos);
  }

  async eliminarLote(id: number, fincaId: number) {
    // Verificamos pertenencia antes de borrar lógicamente
    const lote = await this.loteRepo.findOne({
        where: { lote_id: id, finca: { finca_id: fincaId } }
    });
    if (!lote) throw new Error('Lote no encontrado o no pertenece a tu finca');

    return this.loteRepo.softDelete(id);
  }

  // --- POTREROS ---
  async crearPotrero(datos: any, fincaId: number) {
    return this.potreroRepo.save({ 
        ...datos, 
        finca: { finca_id: fincaId } as any 
    });
  }

  async obtenerPotreros(fincaId: number) {
    return this.potreroRepo.find({
        where: { finca: { finca_id: fincaId } }
    });
  }

  async actualizarPotrero(id: number, datos: any, fincaId: number) {
    const potrero = await this.potreroRepo.findOne({
        where: { potrero_id: id, finca: { finca_id: fincaId } }
    });
    if (!potrero) throw new Error('Potrero no encontrado o no pertenece a tu finca');

    return this.potreroRepo.update(id, datos);
  }

  async eliminarPotrero(id: number, fincaId: number) {
    const potrero = await this.potreroRepo.findOne({
        where: { potrero_id: id, finca: { finca_id: fincaId } }
    });
    if (!potrero) throw new Error('Potrero no encontrado o no pertenece a tu finca');

    return this.potreroRepo.softDelete(id);
  }
}