import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AnimalesService } from './animales.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('animales')
@UseGuards(JwtAuthGuard)
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

  @Post()
  crear(@Body() dto: CreateAnimalDto) {
    return this.animalesService.crear(dto);
  }

  @Get()
  obtenerTodos() {
    return this.animalesService.obtenerTodos();
  }
}