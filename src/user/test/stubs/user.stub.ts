import { AuthLoginDto, AuthRegisterDto } from 'src/user/dto';
import { UserEntity } from 'src/user/user.entity';
import { User, UserRO } from 'src/user/user.interface';

export const userStub = (): User => {
    return {
        bio: 'everything',
        email: 'emmad@gmail.com',
        image: null,
        token: null,
        username: 'emmad',
    };
};

export const userROStub = (): UserRO => {
    return {
        user: userStub(),
    } as UserRO;
};

export const userAuthRegisterDtoStub = (): AuthRegisterDto => {
    const user: User = userStub();
    return {
        email: user.email,
        password: '123456',
        username: user.username,
    };
};

export const userAuthLoginDtoStub = (): AuthLoginDto => {
    const user: User = userStub();
    return {
        email: user.email,
        password: '123456',
    };
};

export const userEntityStub = (): UserEntity => {
    const user: User = userStub();
    return {
        bio: user.bio,
        email: user.email,
        image: user.image,
        username: user.username,
        password: '123456',
        id: 1,
        favoriteArticles: [],
    } as UserEntity;
};
