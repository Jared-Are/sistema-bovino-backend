import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DiagnosticoPrenez } from './diagnostico-prenez.entity';

@Entity('partos')
export class Parto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'finca_id' })
  fincaId: number;

  @Column()
  numero_parto: string;

  @Column()
  tipo_parto: string; // 'Normal', 'Distocico', 'Aborto'

  // --- RELACIONES ---
  // Un parto viene de un Diagnóstico Positivo
  @ManyToOne(() => DiagnosticoPrenez, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'diagnostico_prenez_id' })
  diagnostico_prenez: DiagnosticoPrenez;

  @CreateDateColumn()
  fecha_creacion: Date;
}