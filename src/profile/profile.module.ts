import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from 'src/user/auth.middleware';
import { UserEntity } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { FollowerEntity } from './follower.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([UserEntity ,FollowerEntity]),
    UserModule
  ],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({path: 'profiles/:username', method: RequestMethod.GET}, {path: 'profiles/:username/follow', method: RequestMethod.POST},
      {path: 'profiles/:username/follow', method: RequestMethod.DELETE});
  }
}