import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
const jwt = require('jsonwebtoken')

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService:ConfigService, @InjectRepository(UserEntity) private userRepository:Repository<UserEntity>){}

  async use(req: any, res: any, next: () => void) {
    const authHeader = req.headers.authorization
    if(authHeader){
      try {
        const token:string = authHeader.split(' ') [1]
        const decoded = jwt.verify(token,this.configService.get('SECRET'))
        if(decoded.exp < new Date().getTime()){
          throw new UnauthorizedException({message: "Invalid token"})  
        }
        const user:UserEntity = await this.userRepository.findOne({
          where: {
            id: decoded.id
          }
        })
        
        req.user = user
        next();
        return
      } catch (error) {
        throw new UnauthorizedException({message: "Not authorized"})
      }
    }
    throw new UnauthorizedException({message: "Not authorized"})
  }
}
