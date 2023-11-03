import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1q2w3e4r.',
      database: 'eblog_db',
      entities: [],
      synchronize: true,  //TODO: Why do we need it?
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
