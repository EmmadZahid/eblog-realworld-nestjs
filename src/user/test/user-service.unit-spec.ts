import { BadRequestException, HttpException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { TokenService } from 'src/shared/token.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { UserRO } from '../user.interface';
import { UserService } from '../user.service';
import { userAuthRegisterDtoStub, userEntityStub, userROStub, userStub } from './stubs/user.stub';

describe('UserService', () => {
    let userService: UserService;
    let module: TestingModule;
    let userRepository: Repository<UserEntity>;
    let tokenService: TokenService;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    // envFilePath: '../.env',
                    isGlobal: true,
                }),
                SharedModule,
            ],
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn().mockResolvedValue(userEntityStub()),
                    },
                },
                {
                    provide: TokenService,
                    useValue: {
                        generateJWT: jest.fn().mockReturnValue('jwt token'),
                    },
                },
            ],
        }).compile();

        userService = module.get<UserService>(UserService);
        userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
    });

    describe('register', () => {
        describe('when register is called', () => {
            it('should return proper object on success', async () => {
                const userRO: UserRO = userROStub();
                userRO.user.token = 'jwt token';

                const user: UserRO = await userService.registerUser(userAuthRegisterDtoStub());

                expect(user).toEqual(userRO);
            });

            it('should call findOne of repository', async () => {
                // jest.spyOn(userRepository, 'findOne');
                await userService.registerUser(userAuthRegisterDtoStub());
                expect(userRepository.findOne).toHaveBeenCalled();
            });

            it('should call save of repository', async () => {
                const userEntityStubObj: UserEntity = userEntityStub();
                const userEntity: UserEntity = new UserEntity();

                userEntity.email = userEntityStubObj.email;
                userEntity.password = userEntityStubObj.password;
                userEntity.username = userEntityStubObj.username;

                jest.spyOn(userRepository, 'save').mockResolvedValueOnce(userEntityStub());
                await userService.registerUser(userAuthRegisterDtoStub());
                expect(userRepository.save).toHaveBeenCalled();
                expect(userRepository.save).toHaveBeenCalledWith(userEntity);
            });

            it('should throw error if user already exists', async () => {
                jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(userEntityStub());

                const register = userService.registerUser(userAuthRegisterDtoStub());

                await expect(register).rejects.toThrow(BadRequestException);
            });

            it('should return proper message if user already exists', async () => {
                jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(userEntityStub());

                const register = userService.registerUser(userAuthRegisterDtoStub());
                await expect(register).rejects.toThrowErrorObject({
                    message: 'Username or email already exists',
                });
            });
        });
    });
});
