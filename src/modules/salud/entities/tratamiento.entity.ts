import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity';
import { TipoTratamiento } from './tipo-tratamiento.entity';
import { EstadoTratamiento } from '../../../common/enums';

@Entity('tratamientos')
export class Tratamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'numero_tratamiento', nullable: true, unique: true })
  numero_tratamiento: string;

  @Column({ name: 'tipo_tratamiento_id' })
  tipo_tratamiento_id: number;

  @Column({ type: 'enum', enum: EstadoTratamiento, default: EstadoTratamiento.ACTIVO })
  estado: EstadoTratamiento;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ name: 'animal_id' })
  animal_id: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fecha_eliminacion: Date;

  @ManyToOne(() => TipoTratamiento)
  @JoinColumn({ name: 'tipo_tratamiento_id' })
  tipo_tratamiento: TipoTratamiento;

  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;
}