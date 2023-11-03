import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserAuthService {
    constructor(@InjectRepository(UserEntity) private userRepository:Repository<UserEntity>){}

    async registerUser(dto:AuthRegisterDto):Promise<UserEntity>{
        const user:UserEntity = new UserEntity()
        user.email = dto.email
        user.password = dto.password
        user.username = dto.username

        console.log(user);
        
        const savedUser:UserEntity = await this.userRepository.save(user)
        return savedUser
    }

    loginUser(dto:AuthLoginDto){
        
    }
}
