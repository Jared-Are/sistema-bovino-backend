import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller'; // <-- 1. Importamos el controlador
import { EmailModule } from '../email/email.module'; // <-- 3. Importamos el módulo de email

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    EmailModule, // <-- 4. Agregamos el módulo de email
  ],
  controllers: [UsuariosController], // <-- 2. ¡FALTABA ESTA LÍNEA!
  providers: [UsuariosService],
  exports: [UsuariosService, TypeOrmModule], 
})
export class UsuariosModule {}