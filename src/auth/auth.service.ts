import { Injectable } from '@nestjs/common';
import { AuthLoginDto, AuthRegisterDto } from './dto';

@Injectable()
export class AuthService {

    registerUser(dto:AuthRegisterDto){

    }

    loginUser(dto:AuthLoginDto){
        
    }
}
