import { AuthLoginDto, AuthRegisterDto } from 'src/user/dto';
import { UserEntity } from 'src/user/user.entity';
import { User, UserRO } from 'src/user/user.interface';

export const userStub = (): User => {
    return {
        bio: 'everything',
        email: 'emmad@gmail.com',
        image: null,
        token: 'some token value',
        username: 'emmad',
    } as User;
};

export const userROStub = (): UserRO => {
    return {
        user: userStub(),
    } as UserRO;
};

export const userAuthRegisterDtoStub = (): AuthRegisterDto => {
    return {
        email: 'emmad@gmail.com',
        password: '123456',
        username: 'emmad',
    };
};

export const userAuthLoginDtoStub = (): AuthLoginDto => {
    return {
        email: 'emmad@gmail.com',
        password: '123456',
    };
};

export const userEntityStub = (): UserEntity => {
    return {
        bio: 'everything',
        email: 'emmad@gmail.com',
        image: null,
        username: 'emmad',
        password: '123456',
        id: 1,
        favoriteArticles: [],
    } as UserEntity;
};
