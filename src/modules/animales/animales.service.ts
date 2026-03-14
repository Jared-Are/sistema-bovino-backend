import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Animal } from './entities/animal.entity';
import { CreateAnimalDto } from './dto/create-animal.dto';


@Injectable()
export class AnimalesService {
  constructor(
    @InjectRepository(Animal)
    private readonly animalRepo: Repository<Animal>,
  ) {}

  async crear(dto: CreateAnimalDto) {
    const nuevoAnimal = this.animalRepo.create({
      arete: dto.arete,
      nombre: dto.nombre,
      sexo: dto.sexo,
      peso_nacimiento: dto.peso_nacimiento,
      fecha_nacimiento: dto.fecha_nacimiento,
      // Mapeamos los IDs a objetos de relación
      finca: { finca_id: dto.fincaId } as any,
      raza: { raza_id: dto.razaId } as any,
      lote: dto.loteId ? ({ lote_id: dto.loteId } as any) : null,
    });
    return await this.animalRepo.save(nuevoAnimal);
  }

 async obtenerTodos() {
  return await this.animalRepo.find({
    // Esto hace un "Join" automático en SQL
    relations: {
      finca: true,
      raza: true,
      lote: true
    },
    where: {
      fecha_eliminacion: IsNull() // Solo traer animales activos
    },
    order: {
      fecha_creacion: 'DESC'
    }
  });
}
}