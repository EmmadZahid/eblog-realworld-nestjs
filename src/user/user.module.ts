import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAuthController } from "./user-auth.controller";
import { UserAuthService } from "./user-auth.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([])
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService],
})
export class UserModule {}
