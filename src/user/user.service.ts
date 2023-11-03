import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { UserEntity } from './user.entity';
import { User, UserRO } from './user.interface';
const jwt = require('jsonwebtoken');

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private userRepository:Repository<UserEntity>,
        private configService: ConfigService
    ){}

    async registerUser(dto:AuthRegisterDto):Promise<UserRO>{
        const userFound:UserEntity = await this.userRepository.findOne({
            where:[
                {email: dto.email},
                {username: dto.username}
            ]
        })

        if(userFound){
            throw new BadRequestException({message:"Username or email already exists"})
        }

        const user:UserEntity = new UserEntity()
        user.email = dto.email
        user.password = dto.password
        user.username = dto.username
        
        const savedUser:UserEntity = await this.userRepository.save(user)
        return this.buildUserRO(savedUser)
    }

    loginUser(dto:AuthLoginDto){
        
    }

    private generateToken(user:UserEntity): string{
        let today = new Date();
        let exp = new Date(today);
        exp.setDate(today.getDate() + 60);

        return jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            exp: exp.getTime() / 1000,
        },this.configService.get('SECRET'))
    }

    private buildUserRO(entity:UserEntity):UserRO{
        const user:User = {
            email: entity.email,
            username: entity.username,
            bio: entity.bio,
            image: entity.bio,
            token: this.generateToken(entity)
        }
        return {
            user: user
        }
    }
}
