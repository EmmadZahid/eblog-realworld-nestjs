import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAuthController } from "./user-auth.controller";
import { UserService } from "./user.service";
import { UserEntity } from "./user.entity";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [UserAuthController],
  providers: [UserService],
})
export class UserModule {}
