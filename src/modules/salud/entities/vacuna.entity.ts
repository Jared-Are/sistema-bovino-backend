import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity';

@Entity('vacunas')
export class Vacuna {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string; // Ej: "Fiebre Aftosa", "Brucelosis", "Ántrax"

  @Column()
  veterinario: string;

  @Column({ type: 'date' })
  fecha: string; // Cuándo se aplicó

  @Column({ type: 'date' })
  proximaFecha: string; // ¡Súper útil para Notificaciones después!

  // --- RELACIONES ---
  @ManyToOne(() => Animal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  @Column({ name: 'finca_id' })
  fincaId: number; // Aislamiento SaaS

  @CreateDateColumn()
  fecha_creacion: Date;
}