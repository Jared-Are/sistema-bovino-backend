import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProduccionCarne } from './entities/produccion-carne.entity';
import { ProduccionLechera } from './entities/produccion-lechera.entity';
import { Animal } from '../animales/entities/animal.entity';

@Injectable()
export class ProduccionService {
  constructor(
    @InjectRepository(ProduccionCarne) private produccionCarneRepo: Repository<ProduccionCarne>,
    @InjectRepository(ProduccionLechera) private produccionLecheraRepo: Repository<ProduccionLechera>,
    @InjectRepository(Animal) private animalRepo: Repository<Animal>,
  ) { }

  // =====================================
  // PRODUCCIÓN LECHERA
  // =====================================
  async registrarLeche(datos: any, fincaId: number) {
    const nueva = this.produccionLecheraRepo.create({
      ...datos,
      fincaId,
      animal: { animal_id: datos.animalId } // Relacionamos con la vaca ordeñada
    }) as unknown as ProduccionLechera;
    await this.produccionLecheraRepo.save(nueva);

    return this.produccionLecheraRepo.findOne({
      where: { id: nueva.id },
      relations: ['animal'],
      withDeleted: true
    });
  }

  async obtenerLeche(fincaId: number) {
    return this.produccionLecheraRepo.find({
      where: { fincaId, fecha_eliminacion: IsNull() },
      relations: ['animal'],
      withDeleted: true,
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
    // Verificamos el peso del animal antes de registrar la carne
    const animal = await this.animalRepo.findOne({
      where: { animal_id: datos.animalId, finca: { finca_id: fincaId } }
    });

    if (!animal) throw new NotFoundException('Animal no encontrado');
    const rendimientoMaximo = 0.62; // 62% es el rendimiento máximo teórico de canal
    const pesoMaximoCanal = Number(animal.peso_actual) * rendimientoMaximo;

    if (Number(datos.peso_canal) > pesoMaximoCanal) {
      throw new BadRequestException(
        `El peso del canal (${datos.peso_canal} kg) excede el rendimiento máximo del 62% (${pesoMaximoCanal.toFixed(2)} kg) para un animal de ${animal.peso_actual} kg`
      );
    }

    const nueva = this.produccionCarneRepo.create({
      ...datos,
      fincaId,
      animal: { animal_id: datos.animalId } // Relacionamos con el animal pesado/sacrificado
    }) as unknown as ProduccionCarne;

    await this.produccionCarneRepo.save(nueva);

    // Baja automática del animal (sacrificio/venta)
    await this.animalRepo.softDelete(datos.animalId);

    // Retornamos el registro con los datos del animal para el frontend
    return this.produccionCarneRepo.findOne({
      where: { id: nueva.id },
      relations: ['animal'],
      withDeleted: true
    });
  }

  async obtenerCarne(fincaId: number) {
    return this.produccionCarneRepo.find({
      where: { fincaId, fecha_eliminacion: IsNull() },
      relations: ['animal'],
      withDeleted: true,
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