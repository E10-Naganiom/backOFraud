
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { IncidentsModule } from './incidents/incidents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),
    DbModule,
    UsersModule,
    AdminModule,
    AuthModule,
    IncidentsModule, 
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET   //"supersecret"
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
