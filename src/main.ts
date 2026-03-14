import { NestFactory } from '@nestjs/core'; // 👈 Faltaba esta línea
import { AppModule } from './app.module';   // 👈 Faltaba esta línea
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Esto hace que los DTOs funcionen y validen los datos
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Habilitar CORS para que tu frontend pueda conectarse después
  app.enableCors();

  await app.listen(3000);
  console.log('🚀 Servidor corriendo en: http://localhost:3000');
}
bootstrap();