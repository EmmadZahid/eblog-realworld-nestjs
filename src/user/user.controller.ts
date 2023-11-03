import { Controller, Get } from '@nestjs/common';
import { GetUser } from './decorator/user.decorator';
import { UserEntity } from './user.entity';
import { UserRO } from './user.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService:UserService){}
    
    @Get()
    findMe(@GetUser() currentUser:UserEntity): UserRO{
        return this.userService.buildUserRO(currentUser)
    }
}
