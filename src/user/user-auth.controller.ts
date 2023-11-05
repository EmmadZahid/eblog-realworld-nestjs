import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { UserRO } from './user.interface';

// @UseInterceptors(UserInterceptor)
@Controller('users')
export class UserAuthController {
    constructor(private authService: UserService) {}

    @Post('')
    register(@Body('user') dto: AuthRegisterDto): Promise<UserRO> {
        return this.authService.registerUser(dto);
    }

    @Post('/login')
    login(@Body('user') dto: AuthLoginDto): Promise<UserRO> {
        return this.authService.loginUser(dto);
    }
}
