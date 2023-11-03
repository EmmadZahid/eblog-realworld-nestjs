import { Body, Controller, Get, ParseIntPipe, Put } from '@nestjs/common';
import { GetUser } from './decorator/user.decorator';
import { UpdateUserDto } from './dto';
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

    @Put()
    async updateMe(@GetUser('id', ParseIntPipe) currentUserId:number, @Body('user') dto:UpdateUserDto): Promise<UserRO>{
        return this.userService.updateUser(currentUserId, dto)
    }
}
