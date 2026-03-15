import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Monta } from './monta.entity';

@Entity('diagnosticos_prenez')
export class DiagnosticoPrenez {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'finca_id' })
  fincaId: number;

  @Column()
  numero_prenez: string;

  @Column()
  metodo: string; // Ej: "Palpación", "Ultrasonido"

  @Column()
  resultado: string; // 'Positivo' o 'Negativo'

  @Column({ type: 'date' })
  fecha_programacion: string;

  // --- RELACIONES ---
  // Un diagnóstico siempre depende de una Monta previa
  @ManyToOne(() => Monta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'monta_id' })
  monta: Monta;

  @CreateDateColumn()
  fecha_creacion: Date;
}