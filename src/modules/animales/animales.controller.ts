import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AnimalesService } from './animales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';
import { CrearAnimalDto, ActualizarAnimalDto } from './dto/animal.dto';

@Controller('animales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.OPERARIO)
  create(@Body() body: CrearAnimalDto, @UsuarioActual() usuario: any) {
    return this.animalesService.create(body, usuario.fincaId);
  }

  @Get()
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  findAll(@UsuarioActual() usuario: any) {
    return this.animalesService.findAll(usuario.fincaId);
  }

  @Get(':id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  findOne(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.animalesService.findOne(+id, usuario.fincaId);
  }

  @Patch(':id')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO)
  update(@Param('id') id: string, @Body() body: ActualizarAnimalDto, @UsuarioActual() usuario: any) {
    return this.animalesService.update(+id, body, usuario.fincaId);
  }

  @Delete(':id')
  @Roles(RolUsuario.PROPIETARIO)
  remove(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.animalesService.remove(+id, usuario.fincaId);
  }
}