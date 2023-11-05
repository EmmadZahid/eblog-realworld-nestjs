import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { FollowerEntity } from './follower.entity';
import { Profile, ProfileRO } from './profile.interface';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(FollowerEntity)
        private followerRepository: Repository<FollowerEntity>,
    ) {}

    async getProfile(followerId: number, username: string) {
        const user: UserEntity = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        if (!user)
            throw new BadRequestException({ message: 'Invalid username' });

        const follower: FollowerEntity = await this.followerRepository
            .createQueryBuilder('followers')
            .where('followers.userId = :id', { id: user.id })
            .andWhere('followers.followerId = :followerId', { followerId })
            .getOne();

        return this.buildProfileRO(user, follower ? true : false);
    }

    async doesFollowProfile(
        followerId: number,
        followedId: number,
    ): Promise<boolean> {
        const follower: FollowerEntity = await this.followerRepository
            .createQueryBuilder('followers')
            .where('followers.userId = :id', { id: followedId })
            .andWhere('followers.followerId = :followerId', { followerId })
            .getOne();

        return follower ? true : false;
    }

    async followProfile(
        followerId: number,
        username: string,
    ): Promise<ProfileRO> {
        const user: UserEntity = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        if (!user)
            throw new BadRequestException({ message: 'Invalid username' });

        const follower: FollowerEntity = new FollowerEntity();
        follower.userId = user.id;
        follower.followerId = followerId;

        await this.followerRepository.save(follower);

        return this.buildProfileRO(user, true);
    }

    async unfollowProfile(
        followerId: number,
        username: string,
    ): Promise<ProfileRO> {
        const user: UserEntity = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        if (!user)
            throw new BadRequestException({ message: 'Invalid username' });

        await this.followerRepository.delete({
            followerId,
            userId: user.id,
        });

        return this.buildProfileRO(user, false);
    }

    private buildProfileRO(user: UserEntity, following: boolean): ProfileRO {
        const profile: Profile = {
            bio: user.bio,
            image: user.bio,
            username: user.username,
            following,
        };

        return {
            profile,
        };
    }
}
