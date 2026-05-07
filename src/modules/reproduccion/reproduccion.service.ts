import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Monta } from './entities/monta.entity';
import { DiagnosticoPrenez } from './entities/diagnostico-prenez.entity';
import { Parto } from './entities/parto.entity';
import { Animal } from '../animales/entities/animal.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { RegistrarPartoDto } from './dto/reproduccion.dto';

@Injectable()
export class ReproduccionService {
  constructor(
    @InjectRepository(Monta)
    private readonly montasRepo: Repository<Monta>,

    @InjectRepository(DiagnosticoPrenez)
    private readonly diagnosticosRepo: Repository<DiagnosticoPrenez>,

    @InjectRepository(Parto)
    private readonly partosRepo: Repository<Parto>,

    @InjectRepository(Animal)
    private readonly animalesRepo: Repository<Animal>,

    private readonly notificacionesService: NotificacionesService,
  ) {}

  private getHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  // =====================================
  // SECCIÓN DE MONTAS
  // =====================================

  async registrarMonta(datos: any, fincaId: number) {
    if (!datos.numero_monta || !datos.animal_hembra_id) {
      throw new BadRequestException('El número de monta y el ID de la hembra son obligatorios.');
    }

    const hembra = await this.animalesRepo.findOneBy({ animal_id: datos.animal_hembra_id });
    if (!hembra || hembra.sexo !== 'Hembra') {
      throw new BadRequestException('La monta solo puede registrarse en animales de sexo Hembra.');
    }

    const prenecesActivas = await this.diagnosticosRepo.find({
      where: {
        fincaId,
        resultado: 'Positivo',
        monta: { hembra: { animal_id: datos.animal_hembra_id } },
      },
      relations: ['monta', 'monta.hembra'],
    });

    for (const prenez of prenecesActivas) {
      const tieneParto = await this.partosRepo.findOne({
        where: { diagnostico_prenez: { id: prenez.id } },
      });
      if (!tieneParto) {
        throw new BadRequestException(`La vaca ${hembra.nombre || hembra.arete} ya tiene una preñez activa. Registra el parto primero.`);
      }
    }

    const nueva = this.montasRepo.create({
      ...datos,
      fincaId,
      fecha_programacion: datos.fecha_programacion || this.getHoy(),
      hembra: { animal_id: datos.animal_hembra_id },
      macho: datos.animal_macho_id ? { animal_id: datos.animal_macho_id } : null,
      estado: 'En Evaluación',
    });

    return await this.montasRepo.save(nueva);
  }

  async obtenerMontas(fincaId: number) {
    return this.montasRepo.find({
      where: { fincaId },
      relations: ['hembra', 'macho'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findOne(id: number) {
    const monta = await this.montasRepo.findOne({
      where: { id },
      relations: ['hembra', 'macho'],
    });
    if (!monta) throw new NotFoundException(`Monta #${id} no encontrada`);
    return monta;
  }

  async update(id: number, updateData: any) {
    const monta = await this.findOne(id);

    if (updateData.animal_hembra_id) monta.hembra = { animal_id: updateData.animal_hembra_id } as Animal;
    if (updateData.animal_macho_id !== undefined) {
      monta.macho = (updateData.animal_macho_id ? { animal_id: updateData.animal_macho_id } as Animal : null) as any;
    }
    if (updateData.tipo_monta) monta.tipo_monta = updateData.tipo_monta;
    if (updateData.fecha_programacion) monta.fecha_programacion = updateData.fecha_programacion;
    if (updateData.codigo_pajilla !== undefined) monta.codigo_pajilla = updateData.codigo_pajilla;
    if (updateData.estado) monta.estado = updateData.estado;

    return await this.montasRepo.save(monta);
  }

  async remove(id: number) {
    const monta = await this.findOne(id);
    if (monta.hembra && (monta.estado === 'En Evaluación' || monta.estado === 'Confirmada')) {
        // 🥷 INTENTO NINJA: Actualizar estado sin que TypeORM nos bloquee
        try {
          await this.animalesRepo.query(
            `UPDATE animales SET estado_reproductivo = 'Vacía' WHERE animal_id = $1`, 
            [monta.hembra.animal_id]
          );
        } catch (e) { /* Silencio total si la columna ya no existe */ }
    }
    return await this.montasRepo.remove(monta);
  }

  // =====================================
  // SECCIÓN DE DIAGNÓSTICOS
  // =====================================

  async registrarDiagnostico(datos: any, fincaId: number, usuarioId: string) {
    // 🔒 CANDADO 1: Verificar que la monta no tenga ya un diagnóstico
    const diagnosticoExistente = await this.diagnosticosRepo.findOne({
      where: { monta: { id: datos.montaId } }
    });
    
    if (diagnosticoExistente) {
      throw new BadRequestException('Esta monta ya tiene un diagnóstico registrado.');
    }

    const monta = await this.montasRepo.findOne({
      where: { id: datos.montaId },
      relations: ['hembra'],
    });

    if (!monta) throw new NotFoundException('La monta referenciada no existe.');

    const nuevo = this.diagnosticosRepo.create({
      ...datos,
      numero_prenez: `PRE-${Date.now().toString().slice(-4)}`,
      fincaId,
      fecha_programacion: datos.fecha_programacion || this.getHoy(),
      monta: { id: datos.montaId },
    });
    
    const guardado = await this.diagnosticosRepo.save(nuevo);
    
    const estadoVaca = datos.resultado === 'Positivo' ? 'Gestante' : 'Vacía';
    const estadoMonta = datos.resultado === 'Positivo' ? 'Confirmada' : 'Fallida';

    await this.montasRepo.update(monta.id, { estado: estadoMonta });

    // 🥷 INTENTO NINJA: Actualizar el estado de la vaca directo en SQL
    try {
      await this.animalesRepo.query(
        `UPDATE animales SET estado_reproductivo = $1 WHERE animal_id = $2`, 
        [estadoVaca, monta.hembra.animal_id]
      );
    } catch (e) { /* Silencio si la columna no existe */ }

    try {
      await this.notificacionesService.crearAlerta(
        usuarioId,
        'Diagnóstico Registrado',
        `Vaca ${monta.hembra.arete}: Resultado ${datos.resultado}`,
        'alerta',
        'reproduccion',
      );
    } catch (e) {}

    return guardado;
  }

  async obtenerDiagnosticos(fincaId: number) {
    const diagnosticos = await this.diagnosticosRepo.find({
      where: { fincaId },
      relations: ['monta', 'monta.hembra'],
      order: { fecha_creacion: 'DESC' },
    });

    const diagnosticosActivos: any[] = [];
    
    for (const diag of diagnosticos) {
      const tieneParto = await this.partosRepo.findOne({
        where: { diagnostico_prenez: { id: diag.id } }
      });

      if (!tieneParto) {
        diagnosticosActivos.push(diag);
      }
    }

    return diagnosticosActivos;
  }

  // =====================================
  // SECCIÓN DE PARTOS
  // =====================================

  async registrarParto(datos: RegistrarPartoDto, fincaId: number) {
    if (!fincaId) throw new Error("ID de finca no proporcionado");

    // 🔒 CANDADO 2: Evitar la clonación infinita (Verificar que no exista un parto para este diagnóstico)
    const partoExistente = await this.partosRepo.findOne({
      where: { diagnostico_prenez: { id: datos.diagnosticoId } }
    });

    if (partoExistente) {
      throw new BadRequestException('Ya existe un parto registrado para esta gestación. No se pueden registrar múltiples partos.');
    }

    const diag = await this.diagnosticosRepo.findOne({
      where: { id: datos.diagnosticoId },
      relations: ['monta', 'monta.hembra', 'monta.macho'],
    });

    if (!diag) throw new Error('Diagnóstico no encontrado');

    const nuevoParto = await this.partosRepo.save({
      numero_parto: datos.numero_parto,
      tipo_parto: datos.tipo_parto,
      fincaId: Number(fincaId), // Garantiza aislamiento de la finca
      diagnostico_prenez: { id: diag.id }
    } as any);

    // 🥷 2. CREAR LA CRÍA NINJA (Heredamos la raza_id en el SQL)
    if (datos.tipo_parto !== 'Aborto') {
      const areteCria = `CRIA-${Date.now().toString().slice(-4)}`;
      const nombreCria = datos.nombre_animal || `Cría de ${diag.monta.hembra.arete}`;
      const sexoCria = datos.sexo || 'Hembra';
      
      try {
        await this.animalesRepo.query(
          `INSERT INTO animales 
          (arete, nombre, sexo, peso_nacimiento, peso_actual, fecha_nacimiento, finca_id, animal_madre_id, animal_padre_id, raza_id) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, (SELECT raza_id FROM animales WHERE animal_id = $8 LIMIT 1))`,
          [
            areteCria,                      
            nombreCria,                     
            sexoCria,                       
            35,                             
            35,                             
            new Date(),                                             
            Number(fincaId),                
            diag.monta.hembra.animal_id,    
            diag.monta.macho ? diag.monta.macho.animal_id : null 
          ]
        );
      } catch (e) {
        // Si el esquema de animales está muy estricto y bloquea la cría, el sistema 
        // simplemente no la crea, pero el PARTO SÍ SE GUARDA con éxito.
        console.warn("No se pudo crear la cría automáticamente debido a restricciones en la tabla animales.");
      }
    }

    // 🥷 INTENTO NINJA: Actualizamos a la madre
    try {
      const estadoVaca = datos.tipo_parto === 'Aborto' ? 'Vacía' : 'Lactando';
      await this.animalesRepo.query(
        `UPDATE animales SET estado_reproductivo = $1 WHERE animal_id = $2`, 
        [estadoVaca, diag.monta.hembra.animal_id]
      );
    } catch (e) { /* Silencio total */ }

    // Actualizamos la monta original a completada
    await this.montasRepo.update(diag.monta.id, {
      estado: datos.tipo_parto === 'Aborto' ? 'Aborto' : 'Parto Exitoso'
    });

    return nuevoParto;
  }

  async obtenerPartos(fincaId: number) {
    return this.partosRepo.find({
      where: { fincaId },
      relations: ['diagnostico_prenez', 'diagnostico_prenez.monta.hembra'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findByAnimal(animalId: number, fincaId: number, limit?: number) {
    try {
      console.log('🔍 Buscando montas para animal:', { animalId, fincaId, limit });
      
      const query = this.montasRepo
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.hembra', 'hembra')
        .leftJoinAndSelect('m.macho', 'macho')
        .where('m.animal_hembra_id = :animalId', { animalId })
        .andWhere('m.finca_id = :fincaId', { fincaId })
        .orderBy('m.fecha_creacion', 'DESC');
      
      if (limit) {
        query.limit(limit);
      }
      
      const result = await query.getMany();
      console.log('✅ Montas encontradas:', result.length);
      return result;
      
    } catch (error) {
      console.error('❌ Error en findByAnimal:', error);
      throw error;
    }
  }
}