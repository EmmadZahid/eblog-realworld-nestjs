import { Test, TestingModule } from '@nestjs/testing';
import { AuthLoginDto, AuthRegisterDto } from '../dto';
import { UserAuthController } from '../user-auth.controller';
import { UserController } from '../user.controller';
import { UserRO } from '../user.interface';
import { UserService } from '../user.service';
import { UserMockService } from './mocks/user-mock.service';
import { userAuthLoginDtoStub, userAuthRegisterDtoStub, userEntityStub, userROStub, userUpdateDtoStub } from './stubs/user.stub';

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;
    let module: TestingModule;
    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                UserService,
                {
                    provide: UserService,
                    useValue: {
                        buildUserRO: jest.fn().mockResolvedValue(userROStub()),
                        updateUser: jest.fn().mockResolvedValue(userROStub()),
                    },
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findMe', () => {
        describe('when findMe is called', () => {
            let user: UserRO;

            it('then it should call user service', async () => {
                user = controller.findMe(userEntityStub());
                expect(userService.buildUserRO).toHaveBeenCalled();
            });

            it('then it should call user service with correct params', async () => {
                user = controller.findMe(userEntityStub());
                expect(userService.buildUserRO).toHaveBeenCalledWith(userEntityStub());
            });

            it('then it should return a userRO', async () => {
                user = await controller.findMe(userEntityStub());
                expect(user).toEqual(userROStub());
            });
        });
    });

    describe('updateMe', () => {
        describe('when updateMe is called', () => {
            let user: UserRO;

            it('then it should call user service', async () => {
                user = await controller.updateMe(1, userUpdateDtoStub());
                expect(userService.updateUser).toHaveBeenCalled();
            });

            it('then it should call user service with correct params', async () => {
                user = await controller.updateMe(1, userUpdateDtoStub());
                expect(userService.updateUser).toHaveBeenCalledWith(1, userUpdateDtoStub());
            });

            it('then it should return a userRO', async () => {
                user = await controller.updateMe(1, userUpdateDtoStub());
                expect(user).toEqual(userROStub());
            });
        });
    });
});
