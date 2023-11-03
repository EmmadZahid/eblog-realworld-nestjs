import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAuthController } from "./user-auth.controller";
import { UserAuthService } from "./user-auth.service";
import { UserEntity } from "./user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService],
})
export class UserModule {}
