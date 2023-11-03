import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto, AuthRegisterDto } from './dto';

@Controller('users')
export class AuthController {
    constructor(private authService:AuthService){}
    @Post('')
    register(@Body() dto:AuthRegisterDto){
        this.authService.registerUser(dto)
    }

    @Post('/login')
    login(@Body() dto:AuthLoginDto){
        this.authService.loginUser(dto)
    }
}
