import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity'; // Verifica la ruta si es necesario

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
}