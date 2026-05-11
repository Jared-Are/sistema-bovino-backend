import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SaludService } from './salud.service';
import { Tratamiento } from './entities/tratamiento.entity';
import { TipoTratamiento } from './entities/tipo-tratamiento.entity';
import { Animal } from '../animales/entities/animal.entity';
import { BadRequestException, NotFoundException} from '@nestjs/common';
import { EstadoTratamiento } from '../../common/enums';

describe('SaludService', () => {
  let service: SaludService;
  let mockTratamientoRepo: any;
  let mockTipoRepo: any;
  let mockAnimalRepo: any;

  const mockTipo = { id: 1, nombre: 'Vacunación', finca_id: 1, fecha_eliminacion: null };
  const mockAnimal = { animal_id: 76, finca_id: 1, fecha_eliminacion: null };
  const mockTratamiento = {
    id: 61,
    numero_tratamiento: 'TRAT-0001',
    tipo_tratamiento_id: 1,
    estado: EstadoTratamiento.ACTIVO,
    fecha: new Date('2026-05-10'),
    animal_id: 76,
    descripcion: 'Vacunación anual',
    fecha_eliminacion: null,
  };

  beforeEach(async () => {
    mockTratamientoRepo = {
      create: jest.fn().mockReturnValue(mockTratamiento),
      save: jest.fn().mockResolvedValue(mockTratamiento),
      find: jest.fn().mockResolvedValue([mockTratamiento]),
      findOne: jest.fn().mockImplementation((options) => {
        if (options?.where?.id === 61) return Promise.resolve(mockTratamiento);
        return Promise.resolve(null);
      }),
      count: jest.fn().mockResolvedValue(0),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mockTipoRepo = {
      find: jest.fn().mockResolvedValue([mockTipo]),
      findOne: jest.fn().mockImplementation((options) => {
        if (options?.where?.id === 1) return Promise.resolve(mockTipo);
        return Promise.resolve(null);
      }),
      create: jest.fn().mockReturnValue(mockTipo),
      save: jest.fn().mockResolvedValue(mockTipo),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    };

    mockAnimalRepo = {
      findOne: jest.fn().mockImplementation((options) => {
        if (options?.where?.animal_id === 76) return Promise.resolve(mockAnimal);
        return Promise.resolve(null);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaludService,
        { provide: getRepositoryToken(Tratamiento), useValue: mockTratamientoRepo },
        { provide: getRepositoryToken(TipoTratamiento), useValue: mockTipoRepo },
        { provide: getRepositoryToken(Animal), useValue: mockAnimalRepo },
      ],
    }).compile();

    service = module.get<SaludService>(SaludService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTratamiento', () => {
    const datos = { tipo_tratamiento_id: 1, animal_id: 76, fecha: '2026-05-10' };

    it('debe crear un tratamiento', async () => {
      const result = await service.createTratamiento(datos, 1);
      expect(result).toEqual(mockTratamiento);
    });

    it('debe rechazar si el tipo no existe', async () => {
      const datos1 = { ...datos, tipo_tratamiento_id: 999 };
      await expect(service.createTratamiento(datos1, 1)).rejects.toThrow(NotFoundException);
    });

    it('debe rechazar si el animal no existe', async () => {
      const datos2 = { ...datos, animal_id: 999 };
      await expect(service.createTratamiento(datos2, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllTratamientos', () => {
    it('debe retornar todos los tratamientos', async () => {
      const result = await service.findAllTratamientos(1);
      expect(result).toEqual([mockTratamiento]);
    });
  });

  describe('findOneTratamiento', () => {
    it('debe retornar un tratamiento por ID', async () => {
      const result = await service.findOneTratamiento(61, 1);
      expect(result).toEqual(mockTratamiento);
    });

    it('debe lanzar error si no existe', async () => {
      await expect(service.findOneTratamiento(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTratamiento', () => {
    it('debe actualizar un tratamiento', async () => {
      const result = await service.updateTratamiento(61, { descripcion: 'nueva' }, 1);
      expect(result).toEqual(mockTratamiento);
    });

    it('debe lanzar error si el tratamiento no existe', async () => {
      mockTratamientoRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateTratamiento(999, { descripcion: 'nueva' }, 1))
      .rejects.toThrow(NotFoundException);
    });
  });

  describe('removeTratamiento', () => {
    it('debe eliminar un tratamiento', async () => {
      const result = await service.removeTratamiento(61, 1);
      expect(result).toEqual({ message: 'Tratamiento eliminado correctamente' });
      expect(mockTratamientoRepo.softDelete).toHaveBeenCalledWith(61);
    });

    it('debe lanzar error si no existe', async () => {
      mockTratamientoRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.removeTratamiento(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAnimal', () => {
    it('debe retornar tratamientos por animal', async () => {
      const result = await service.findByAnimal(76, 1);
      expect(result).toEqual([mockTratamiento]);
    });
  });
});