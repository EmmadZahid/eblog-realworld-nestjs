import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthController } from './user-auth.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { AuthMiddleware } from './auth.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserAuthController, UserController],
    providers: [UserService],
})
export class UserModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({ path: 'user', method: RequestMethod.GET }, { path: 'user', method: RequestMethod.PUT });
    }
}
