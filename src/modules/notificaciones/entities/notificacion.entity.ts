import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity'; 

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  // Las notificaciones son personales, así que se ligan directamente al Usuario
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  titulo: string;

  @Column('text')
  mensaje: string;

  @Column()
  tipo: string; // Ej: 'alerta', 'recordatorio', 'sistema'

  @Column()
  modulo: string; // Ej: 'salud', 'reproduccion'

  @Column({ default: false })
  leida: boolean;

  @CreateDateColumn()
  fecha_creacion: Date;
}