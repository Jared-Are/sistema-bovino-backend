import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animal } from './entities/animal.entity'; // Asegúrate de que esta ruta coincida con tu proyecto

@Injectable()
export class AnimalesService {
  constructor(
    @InjectRepository(Animal)
    private animalesRepository: Repository<Animal>,
  ) {}

  async create(datos: any, fincaId: number) {
    // 1. Forzamos la relación Multi-Tenant. 
    // Aunque un hacker intente mandar finca_id: 5 en el JSON, esto lo sobrescribe.
    const nuevoAnimal = this.animalesRepository.create({
      ...datos,
      finca: { finca_id: fincaId } 
    });
    return this.animalesRepository.save(nuevoAnimal);
  }

  async findAll(fincaId: number) {
    // 2. Filtramos la búsqueda. Solo trae los que coincidan con la finca del Token.
    return this.animalesRepository.find({
      where: { finca: { finca_id: fincaId } },
      relations: ['raza', 'lote', 'potrero'], // Ajusta esto según las relaciones que le hayas puesto a tu Entidad
    });
  }

  async findOne(id: number, fincaId: number) {
    // 3. Buscamos por ID, pero SIEMPRE verificando que pertenezca a la finca
    const animal = await this.animalesRepository.findOne({
      where: { animal_id: id, finca: { finca_id: fincaId } },
      relations: ['raza', 'lote', 'potrero'],
    });

    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado en tu finca.`);
    }
    return animal;
  }

  async update(id: number, datos: any, fincaId: number) {
    // 4. Reutilizamos el findOne para asegurarnos de que el animal existe y es suyo
    const animal = await this.findOne(id, fincaId);
    
    // Mezclamos los datos viejos con los nuevos y guardamos
    this.animalesRepository.merge(animal, datos);
    return this.animalesRepository.save(animal);
  }

  async remove(id: number, fincaId: number) {
    // 5. Verificamos pertenencia antes de borrar
    const animal = await this.findOne(id, fincaId);
    return this.animalesRepository.remove(animal);
  }
}