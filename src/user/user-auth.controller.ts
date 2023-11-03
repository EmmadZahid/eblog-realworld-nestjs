import { Body, Controller, Post } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { AuthLoginDto, AuthRegisterDto } from './dto';

@Controller('users')
export class UserAuthController {
    constructor(private authService:UserAuthService){}
    @Post('')
    register(@Body('user') dto:AuthRegisterDto){
        console.log(dto);
        
        this.authService.registerUser(dto)
    }

    @Post('/login')
    login(@Body() dto:AuthLoginDto){
        this.authService.loginUser(dto)
    }
}
