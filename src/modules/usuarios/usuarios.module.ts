import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller'; // <-- 1. Importamos el controlador

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuariosController], // <-- 2. ¡FALTABA ESTA LÍNEA!
  providers: [UsuariosService],
  exports: [UsuariosService, TypeOrmModule], 
})
export class UsuariosModule {}