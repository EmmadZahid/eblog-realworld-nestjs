import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [
    UserModule,
    ProfileModule,
    ConfigModule.forRoot({
      // envFilePath: '../.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      //TODO: Thing how we can read all these configurations from .env and give it here
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1q2w3e4r.',
      database: 'eblog_db',
      autoLoadEntities: true, //It will load all the entities mentioned in 'entities' of forFeature()
      synchronize: true, //TODO: Why do we need it?
    }),
    ProfileModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
