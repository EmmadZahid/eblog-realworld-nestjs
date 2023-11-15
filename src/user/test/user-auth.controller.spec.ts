import { Test, TestingModule } from '@nestjs/testing';
import { AuthLoginDto, AuthRegisterDto } from '../dto';
import { UserAuthController } from '../user-auth.controller';
import { UserRO } from '../user.interface';
import { UserService } from '../user.service';
import { UserMockService } from './mocks/user-mock.service';
import { userAuthLoginDtoStub, userAuthRegisterDtoStub, userROStub } from './stubs/user.stub';

describe('UserAuthController', () => {
    let controller: UserAuthController;
    let userService: UserService;
    let module: TestingModule;
    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [UserAuthController],
            providers: [
                UserService,
                {
                    provide: UserService,
                    useValue: {
                        registerUser: jest.fn().mockResolvedValue(userROStub()),
                        loginUser: jest.fn().mockResolvedValue(userROStub()),
                    },
                },
            ],
        }).compile();

        controller = module.get<UserAuthController>(UserAuthController);
        userService = module.get<UserService>(UserService);
        jest.clearAllMocks();
    });

    // afterEach(() => {
    //     module.close();
    // });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        describe('when register is called', () => {
            let user: UserRO;

            it('then it should call user service', async () => {
                user = await controller.register(userAuthRegisterDtoStub());
                expect(userService.registerUser).toHaveBeenCalled();
            });

            it('then it should call user service with correct params', async () => {
                user = await controller.register(userAuthRegisterDtoStub());
                expect(userService.registerUser).toHaveBeenCalledWith(userAuthRegisterDtoStub());
            });

            it('then it should return a userRO', () => {
                expect(user).toEqual(userROStub());
            });
        });
    });

    describe('login', () => {
        describe('when login is called', () => {
            let user: UserRO;

            it('then it should call user service', async () => {
                user = await controller.login(userAuthLoginDtoStub());
                expect(userService.loginUser).toHaveBeenCalled();
            });

            it('then it should call user service with correct params', async () => {
                user = await controller.login(userAuthLoginDtoStub());
                expect(userService.loginUser).toHaveBeenCalledWith(userAuthLoginDtoStub());
            });

            it('then it should return a userRO', () => {
                expect(user).toEqual(userROStub());
            });
        });
    });
});
