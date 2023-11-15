import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthLoginDto, AuthRegisterDto, UpdateUserDto } from './dto';
import { UserEntity } from './user.entity';
import { User, UserRO } from './user.interface';
import * as argon from 'argon2';
import { TokenService } from 'src/shared/token.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private tokenService: TokenService,
    ) {}

    async registerUser(dto: AuthRegisterDto): Promise<UserRO> {
        const userFound: UserEntity = await this.userRepository.findOne({
            where: [{ email: dto.email }, { username: dto.username }],
        });

        if (userFound) {
            throw new BadRequestException({
                message: 'Username or email already exists',
            });
        }

        const user: UserEntity = new UserEntity();
        user.email = dto.email;
        user.password = dto.password;
        user.username = dto.username;

        const savedUser: UserEntity = await this.userRepository.save(user);
        return this.buildUserRO(savedUser);
    }

    async loginUser(dto: AuthLoginDto): Promise<UserRO> {
        const userFound: UserEntity = await this.userRepository.findOne({
            where: {
                email: dto.email,
            },
        });

        if (!userFound) {
            throw new UnauthorizedException({
                message: 'Invalid email or password',
            });
        }

        const isMatch: boolean = await argon.verify(userFound.password, dto.password);

        if (!isMatch) {
            throw new UnauthorizedException({
                message: 'Invalid email or password',
            });
        }

        return this.buildUserRO(userFound);
    }

    async updateUser(currentUserId: number, dto: UpdateUserDto): Promise<UserRO> {
        const user: UserEntity = await this.userRepository.findOne({
            where: {
                id: currentUserId,
            },
        });

        if (!user) {
            throw new BadRequestException({
                message: "User doesn't exists.",
            });
        }

        user.bio = dto.bio;
        user.email = dto.email;
        user.image = dto.image;

        const savedUser: UserEntity = await this.userRepository.save(user);
        return this.buildUserRO(savedUser);
    }

    public buildUserRO(entity: UserEntity, includeToken: boolean = true): UserRO {
        const tokenData: { email: string; username: string; id: number } = {
            email: entity.email,
            username: entity.username,
            id: entity.id,
        };

        const user: User = {
            email: entity.email,
            username: entity.username,
            bio: entity.bio ? entity.bio : '',
            image: entity.image ? entity.image : null,
            token: includeToken ? this.tokenService.generateJWT(tokenData) : null,
        };
        if (!includeToken) delete user.token;
        return {
            user: user,
        };
    }
}
