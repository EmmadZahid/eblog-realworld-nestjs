import { BadRequestException } from '@nestjs/common';
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
                        save: jest.fn().mockResolvedValue(userStub()),
                    },
                },
                TokenService,
            ],
        }).compile();
        userService = module.get<UserService>(UserService);
        userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
        tokenService = module.get<TokenService>(TokenService);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(userService).toBeDefined();
    });
    describe('register', () => {
        describe('when register is called', () => {
            it('should call findOne of repository', async () => {
                jest.spyOn(userRepository, 'findOne');
                jest.spyOn(userRepository, 'save').mockResolvedValueOnce(userEntityStub());
                await userService.registerUser(userAuthRegisterDtoStub());
                expect(userRepository.findOne).toHaveBeenCalled();
            });

            it('should call save of repository', async () => {
                jest.spyOn(userRepository, 'save').mockResolvedValueOnce(userEntityStub());
                await userService.registerUser(userAuthRegisterDtoStub());
                expect(userRepository.save).toHaveBeenCalled();
            });

            it('should call throw error if user already exists', async () => {
                jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(userEntityStub());

                let badRequestException: boolean;
                try {
                    await userService.registerUser(userAuthRegisterDtoStub());
                } catch (error) {
                    if (error instanceof BadRequestException) badRequestException = true;
                }

                expect(badRequestException).toBeTruthy();
            });

            it('should return proper object on success', async () => {
                const userRO: UserRO = userROStub();
                userRO.user.token = null;

                jest.spyOn(userRepository, 'save').mockResolvedValueOnce(userEntityStub());

                const user: UserRO = await userService.registerUser(userAuthRegisterDtoStub());
                user.user.token = null;
                expect(user).toEqual(userRO);
            });
        });
    });
});
