import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity'; // Asegúrate de que la ruta coincida con tu proyecto

@Entity('tratamientos')
export class Tratamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string; // Ej: "Antibiótico", "Desparasitante", "Vitamina"

  @Column()
  veterinario: string; // Quién lo aplicó

  @Column({ default: 'activo' })
  estado: string; // 'activo', 'completado', 'suspendido'

  @Column({ type: 'date' })
  fecha: string;

  // --- RELACIONES ---
  @ManyToOne(() => Animal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  // Aislamiento SaaS
  @Column({ name: 'finca_id' })
  fincaId: number;

  @CreateDateColumn()
  fecha_creacion: Date;
}