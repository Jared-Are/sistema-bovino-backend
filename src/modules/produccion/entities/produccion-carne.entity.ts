import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity';

@Entity('produccion_carne')
export class ProduccionCarne {
  @PrimaryGeneratedColumn()
  id: number;

  // 🛡️ Aislamiento SaaS
  @Column({ name: 'finca_id' })
  fincaId: number;

  @ManyToOne(() => Animal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  // Peso en kilogramos (ej: 250.50)
  @Column('decimal', { precision: 10, scale: 2 })
  peso_canal: number;

  @CreateDateColumn()
  fecha_creacion: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;
}