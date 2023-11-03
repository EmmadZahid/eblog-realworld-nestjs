import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserEntity } from './user/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1q2w3e4r.',
      database: 'eblog_db',
      autoLoadEntities: true, //It will load all the entities mentioned in 'entities' of forFeature()
      synchronize: true,  //TODO: Why do we need it?
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
