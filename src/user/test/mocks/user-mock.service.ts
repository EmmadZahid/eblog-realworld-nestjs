import { userROStub, userStub } from '../stubs/user.stub';

export const UserMockService = jest.fn().mockReturnValue({
    registerUser: jest.fn().mockResolvedValue(userROStub()),
    loginUser: jest.fn().mockResolvedValue(userROStub()),
});
