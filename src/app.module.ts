import { Module } from '@nestjs/common';
import { ParametrosModule } from './modules/parametros/parametros.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FincasModule } from './modules/fincas/fincas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AnimalesModule } from './modules/animales/animales.module';
import { AuthModule } from './modules/auth/auth.module';
import { SaludModule } from './modules/salud/salud.module';
import { ReproduccionModule } from './modules/reproduccion/reproduccion.module';
import { ProduccionModule } from './modules/produccion/produccion.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';

@Module({
  imports: [
    // 1. Cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Conexión a Supabase usando los datos de tu .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'), // Usará el 6543 de tu archivo
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Esto creará las tablas automáticamente al definir Entidades
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),

    FincasModule,

    UsuariosModule,
    AuthModule,
    AnimalesModule,
    ParametrosModule,
    SaludModule,
    ReproduccionModule,
    ProduccionModule,
    NotificacionesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
