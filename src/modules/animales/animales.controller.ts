import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AnimalesService } from './animales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario.decorator';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
@Controller('animales')
@UseGuards(JwtAuthGuard)
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAnimalDto: CreateAnimalDto, @UsuarioActual() usuario: any) {
    return this.animalesService.create(createAnimalDto, usuario.fincaId);
  }

  @Get()
  findAll(@UsuarioActual() usuario: any) {
    return this.animalesService.findAll(usuario.fincaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.animalesService.findOne(+id, usuario.fincaId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateAnimalDto: UpdateAnimalDto, 
    @UsuarioActual() usuario: any
  ) {
    return this.animalesService.update(+id, updateAnimalDto, usuario.fincaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.animalesService.remove(+id, usuario.fincaId);
  }
}