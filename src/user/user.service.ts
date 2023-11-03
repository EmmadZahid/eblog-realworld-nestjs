import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthLoginDto, AuthRegisterDto, UpdateUserDto } from './dto';
import { UserEntity } from './user.entity';
import { User, UserRO } from './user.interface';
import * as argon from 'argon2'

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

    async loginUser(dto:AuthLoginDto):Promise<UserRO>{
        const userFound:UserEntity = await this.userRepository.findOne({
            where:{
                email: dto.email
            }
        })

        if(!userFound){
            throw new UnauthorizedException({message:"Invalid email or password"})
        }

        const isMatch:boolean = await argon.verify(userFound.password,dto.password)
        
        if(!isMatch){
            throw new UnauthorizedException({message:"Invalid email or password"})
        }

        return this.buildUserRO(userFound)
    }

    async updateUser(currentUserId:number, dto:UpdateUserDto):Promise<UserRO>{
        const user:UserEntity = await this.userRepository.findOne({
            where:{
                id: currentUserId
            }
        })

        user.bio = dto.bio
        user.email = dto.email
        user.image = dto.image

        try {
            const savedUser:UserEntity = await this.userRepository.save(user) 
               
            return this.buildUserRO(savedUser)
        } catch (error) {
            throw error
        }
    }

    private generateJWT(user:UserEntity): string{
        
        return jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            exp: new Date().getTime() + (60 * 60 * 1000),   //on hour
        },this.configService.get('SECRET'))
    }

    public buildUserRO(entity:UserEntity, includeToken:boolean = true):UserRO{
        const user:User = {
            email: entity.email,
            username: entity.username,
            bio: (entity.bio) ? entity.bio : '',
            image: (entity.image) ? entity.image : null,
            token: (includeToken) ? this.generateJWT(entity) : null
        }
        if(!includeToken)
            delete user.token
        return {
            user: user
        }
    }
}
