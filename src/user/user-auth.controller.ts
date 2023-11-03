import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { UserInterceptor } from './user.interceptor';
import { UserRO } from './user.interface';

// @UseInterceptors(UserInterceptor)
@Controller('users')
export class UserAuthController {
    constructor(private authService:UserService){}

    @Post('')
    register(@Body('user') dto:AuthRegisterDto):Promise<UserRO>{
        return this.authService.registerUser(dto)
    }

    @Post('/login')
    login(@Body() dto:AuthLoginDto){
        this.authService.loginUser(dto)
    }
}
