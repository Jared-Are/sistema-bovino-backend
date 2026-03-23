import { Entity, DeleteDateColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { RolUsuario, EstadoUsuario } from '../../../common/enums';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  usuario_id: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ length: 20 })
  telefono: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.OPERARIO })
  rol: RolUsuario;

  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO })
  estado: EstadoUsuario;

  // Usamos string 'Finca' para evitar el error de metadata
  @ManyToOne('Finca', 'usuarios')
  @JoinColumn({ name: 'finca_id' })
  finca: any;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;

  // Agrégalo donde están tus otras columnas
  @Column({ select: false }) // select: false es una excelente práctica de seguridad
  contrasena: string;

  @Column({ default: true }) // Lo que pediste para forzar el cambio
  debe_cambiar_contrasena: boolean;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true }) // ← AGREGAR
  fecha_eliminacion: Date;
}