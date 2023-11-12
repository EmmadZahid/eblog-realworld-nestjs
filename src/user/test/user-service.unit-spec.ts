import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthRegisterDto } from '../dto';
import { UserAuthController } from '../user-auth.controller';
import { UserEntity } from '../user.entity';
import { UserRO } from '../user.interface';
import { UserService } from '../user.service';
import { UserMockService } from './mocks/user-mock.service';
import { userAuthRegisterDtoStub, userEntityStub, userROStub, userStub } from './stubs/user.stub';

describe('UserService', () => {
    let userService: UserService;
    let module: TestingModule;
    let userRepository: Repository<UserEntity>;
    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    // envFilePath: '../.env',
                    isGlobal: true,
                }),
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
            ],
        }).compile();
        userService = module.get<UserService>(UserService);
        userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
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
        });
    });
});
