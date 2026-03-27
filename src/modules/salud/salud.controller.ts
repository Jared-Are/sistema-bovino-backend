import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SaludService } from './salud.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import { CreateTipoTratamientoDto } from './dto/create-tipo-tratamiento.dto';
import { UpdateTipoTratamientoDto } from './dto/update-tipo-tratamiento.dto';

@Controller('salud')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  @Post('tipos-tratamiento')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  createTipo(@Body() dto: CreateTipoTratamientoDto, @UsuarioActual() usuario: any) {
    return this.saludService.createTipo(dto, usuario.fincaId); 
  }

  @Get('tipos-tratamiento')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  findAllTipos(@UsuarioActual() usuario: any) {
    return this.saludService.findAllTipos(usuario.fincaId); 
  }

  @Get('tipos-tratamiento/check-nombre')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  async verificarNombreTipo(
    @Query('nombre') nombre: string,
    @Query('excludeId') excludeId: string,
    @UsuarioActual() usuario: any
  ) {
    const exists = await this.saludService.verificarNombreTipo(
      nombre, 
      usuario.fincaId, 
      excludeId ? parseInt(excludeId) : undefined
    );
    return { exists };
  }

  @Get('tipos-tratamiento/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  findOneTipo(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.saludService.findOneTipo(+id, usuario.fincaId); 
  }

  @Patch('tipos-tratamiento/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  updateTipo(@Param('id') id: string, @Body() dto: UpdateTipoTratamientoDto, @UsuarioActual() usuario: any) {
    return this.saludService.updateTipo(+id, dto, usuario.fincaId); 
  }

  @Delete('tipos-tratamiento/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  removeTipo(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.saludService.removeTipo(+id, usuario.fincaId); 
  }

  // ===== TRATAMIENTOS =====
  @Post('tratamientos')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  createTratamiento(@Body() dto: CreateTratamientoDto, @UsuarioActual() usuario: any) {
    return this.saludService.createTratamiento(dto, usuario.fincaId);
  }

  @Get('tratamientos')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  findAllTratamientos(
    @UsuarioActual() usuario: any,
    @Query('animalId') animalId?: string,  
    @Query('limit') limit?: string          
  ) {
    if (animalId) {
      return this.saludService.findByAnimal(
        parseInt(animalId),
        usuario.fincaId,
        limit ? parseInt(limit) : undefined
      );
    }
    return this.saludService.findAllTratamientos(usuario.fincaId);
  }

  @Get('tratamientos/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  findOneTratamiento(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.saludService.findOneTratamiento(+id, usuario.fincaId);
  }

  @Patch('tratamientos/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  updateTratamiento(@Param('id') id: string, @Body() dto: UpdateTratamientoDto, @UsuarioActual() usuario: any) {
    return this.saludService.updateTratamiento(+id, dto, usuario.fincaId);
  }

  @Delete('tratamientos/:id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  removeTratamiento(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.saludService.removeTratamiento(+id, usuario.fincaId);
  }
}