import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Finca } from '../../fincas/entities/finca.entity';
import { Raza } from '../../parametros/entities/raza.entity';
import { Lote } from '../../parametros/entities/lote.entity';
import { Potrero } from '../../parametros/entities/potrero.entity';
import { SexoAnimal } from '../../../common/enums';

@Entity('animales')
export class Animal {
  @PrimaryGeneratedColumn()
  animal_id: number;

  @Column({ length: 50 })
  arete: string;

  @Column({ length: 100, nullable: true })
  nombre: string;

  @Column({ type: 'enum', enum: SexoAnimal })
  sexo: SexoAnimal;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  peso_nacimiento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  peso_actual: number;

  @Column({ type: 'timestamptz' })
  fecha_nacimiento: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_destete: Date;

  @Column({ length: 255, nullable: true })
  imagen: string;

  // --- RELACIONES ---
  @ManyToOne(() => Finca)
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

  @ManyToOne(() => Raza)
  @JoinColumn({ name: 'raza_id' })
  raza: Raza;

  @ManyToOne(() => Lote, { nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @ManyToOne(() => Potrero, { nullable: true })
  @JoinColumn({ name: 'potrero_id' })
  potrero: Potrero;

  @ManyToOne(() => Animal, { nullable: true })
  @JoinColumn({ name: 'animal_madre_id' })
  madre: Animal;

  @ManyToOne(() => Animal, { nullable: true })
  @JoinColumn({ name: 'animal_padre_id' })
  padre: Animal;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  fecha_actualizacion: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;
}