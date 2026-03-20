import { Controller, Get, Post, Body, UseGuards, Param, Patch,Delete } from '@nestjs/common';
import { ReproduccionService } from './reproduccion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolUsuario } from '../../common/enums';
import { RegistrarMontaDto, RegistrarDiagnosticoDto, RegistrarPartoDto } from './dto/reproduccion.dto';

@Controller('reproduccion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReproduccionController {
  constructor(private readonly reproduccionService: ReproduccionService) {}

  @Post('montas')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  registrarMonta(
    @Body() body: RegistrarMontaDto,
    @UsuarioActual() usuario: any,
  ) {
    return this.reproduccionService.registrarMonta(body, usuario.fincaId);
  }

  @Get('montas')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerMontas(@UsuarioActual() usuario: any) {
    return this.reproduccionService.obtenerMontas(usuario.fincaId);
  }

  @Get('montas/:id')
  findOne(@Param('id') id: string) {
    return this.reproduccionService.findOne(+id);
  }

  @Patch('montas/:id')
  update(@Param('id') id: string, @Body() updateData: RegistrarMontaDto) {
    return this.reproduccionService.update(+id, updateData);
  }

  @Delete('montas/:id')
  remove(@Param('id') id: string) {
    return this.reproduccionService.remove(+id);
  }

  @Post('diagnosticos')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  registrarDiagnostico(
    @Body() body: RegistrarDiagnosticoDto,
    @UsuarioActual() usuario: any,
  ) {
    return this.reproduccionService.registrarDiagnostico(body, usuario.fincaId, usuario.userId);
  }

  @Get('diagnosticos')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerDiagnosticos(@UsuarioActual() usuario: any) {
    return this.reproduccionService.obtenerDiagnosticos(usuario.fincaId);
  }

  @Post('partos')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  registrarParto(
    @Body() body: RegistrarPartoDto,
    @UsuarioActual() usuario: any,
  ) {
    return this.reproduccionService.registrarParto(body, usuario.fincaId, usuario.userId);
  }

  @Get('partos')
  @Roles(RolUsuario.PROPIETARIO, RolUsuario.VETERINARIO, RolUsuario.OPERARIO)
  obtenerPartos(@UsuarioActual() usuario: any) {
    return this.reproduccionService.obtenerPartos(usuario.fincaId);
  }
}

