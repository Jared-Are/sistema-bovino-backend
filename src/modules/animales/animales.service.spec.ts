import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnimalesService } from './animales.service';
import { Animal } from './entities/animal.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SexoAnimal } from '../../common/enums';
import { IsNull } from 'typeorm';

describe('AnimalesService', () => {
  let service: AnimalesService;
  let mockRepository: any;

  const animalMock = {
    animal_id: 9,
    arete: 'NIC-2026-001',
    nombre: 'La Consentida',
    sexo: SexoAnimal.HEMBRA,
    peso_nacimiento: 35.50,
    peso_actual: 45.50,
    fecha_nacimiento: new Date('2026-03-01'),
    fecha_destete: null,
    imagen: null,
    finca: { finca_id: 1 },
    raza: null,
    lote: null,
    potrero: null,
    madre: null,
    padre: null,
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date(),
    fecha_eliminacion: null,
  };

  const mockAnimales = [animalMock];

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        animal_id: 100,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      })),
      save: jest.fn().mockImplementation((animal) => Promise.resolve(animal)),
      find: jest.fn().mockResolvedValue(mockAnimales),
      findOne: jest.fn().mockImplementation((options) => {
        if (options.where?.animal_id === 9) {
          return Promise.resolve({ ...animalMock });
        }
        if (options.where?.arete === 'NIC-2026-001') {
          return Promise.resolve({ ...animalMock });
        }
        return Promise.resolve(null);
      }),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnimalesService,
        { provide: getRepositoryToken(Animal), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AnimalesService>(AnimalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debe retornar todos los animales activos de la finca', async () => {
      const animalesFinca1 = mockAnimales.filter(a => a.finca.finca_id === 1);
      mockRepository.find.mockResolvedValue(animalesFinca1);
      
      const result = await service.findAll(1);
      
      expect(result).toEqual(animalesFinca1);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { finca: { finca_id: 1 }, fecha_eliminacion: IsNull() },
        relations: ['raza', 'lote', 'potrero', 'madre', 'padre'],
      });
    });
  });

  describe('findOne', () => {
    it('debe retornar un animal por ID', async () => {
      const result = await service.findOne(9, 1);
      
      expect(result).toEqual(animalMock);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          animal_id: 9,
          finca: { finca_id: 1 },
          fecha_eliminacion: IsNull(),
        },
        relations: ['raza', 'lote', 'potrero', 'madre', 'padre'],
      });
    });

    it('debe lanzar NotFoundException si el animal no existe', async () => {
      await expect(service.findOne(19, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const datosValidos = {
      arete: 'NUEVO-001',
      sexo: SexoAnimal.HEMBRA,
      peso_nacimiento: 40,
      fecha_nacimiento: '2026-05-01',
    };

    it('debe crear un animal con datos válidos', async () => {
      
      const result = await service.create(datosValidos, 1);
      
      expect(result).toMatchObject({
        arete: 'NUEVO-001',
        sexo: SexoAnimal.HEMBRA,
        peso_nacimiento: 40,
        peso_actual: 40,
        fecha_nacimiento: '2026-05-01',
        finca: { finca_id: 1 },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debe rechazar fecha_destete anterior a nacimiento', async () => {
      const datosInvalidos = { ...datosValidos, fecha_destete: '2025-01-01' };
      
      await expect(service.create(datosInvalidos, 1)).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar si falta arete', async () => {
      const sinArete = { ...datosValidos, arete: undefined };
      
      await expect(service.create(sinArete as any, 1)).rejects.toThrow();
    });
  });

  describe('update', () => {
    const datosValidos = {
      nombre: 'La Consentida Actualizada',
      peso_actual: 55.50,
    };

    it('debe actualizar un animal con datos válidos', async () => {
      const result = await service.update(9, datosValidos, 1);
      
      expect(result.nombre).toBe('La Consentida Actualizada');
      expect(result.peso_actual).toBe(55.50);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debe rechazar fecha_destete anterior al nacimiento', async () => {
      const fechaInvalida = { fecha_destete: '2025-01-01' };
      
      await expect(service.update(9, fechaInvalida, 1)).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar si el animal no existe', async () => {
      await expect(service.update(10, datosValidos, 1)).rejects.toThrow(NotFoundException);
    });

  });

  describe('remove', () => {
    it('debe eliminar un animal existente', async () => {
      const result = await service.remove(9, 1);
      
      expect(result).toEqual({ affected: 1 });
      expect(mockRepository.softDelete).toHaveBeenCalledWith(9);
    });

    it('debe rechazar si el animal no existe', async () => {
      await expect(service.remove(10, 1)).rejects.toThrow(NotFoundException);
    });
  });
});