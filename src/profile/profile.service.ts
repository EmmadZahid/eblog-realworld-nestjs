import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { FollowingEntity } from './following.entity';
import { Profile, ProfileRO } from './profile.interface';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(FollowingEntity)
        private followingRepository: Repository<FollowingEntity>,
    ) {}

    async getProfile(followerId: number, username: string) {
        const user: UserEntity = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        if (!user)
            throw new BadRequestException({ message: 'Invalid username' });

        const follower: FollowingEntity = await this.followingRepository
            .createQueryBuilder('following')
            .where('following.followedId = :id', { id: user.id })
            .andWhere('following.followerId = :followerId', { followerId })
            .getOne();

        return this.buildProfileRO(user, follower ? true : false);
    }

    async doesFollowProfile(
        followerId: number,
        followedId: number,
    ): Promise<boolean> {
        const follower: FollowingEntity = await this.followingRepository
            .createQueryBuilder('following')
            .where('following.followedId = :id', { id: followedId })
            .andWhere('following.followerId = :followerId', { followerId })
            .getOne();

        return follower ? true : false;
    }

    async getFollowedAuthorIds(currentUserId: number): Promise<number[]> {
        const userFollowing: FollowingEntity[] =
            await this.followingRepository.find({
                where: {
                    follower: {
                        id: currentUserId,
                    },
                },
                relations: ['followed'],
            });

        const authorIds: number[] = userFollowing.map(
            (record: FollowingEntity) => record.followed.id,
        );

        return authorIds;
    }

    async followProfile(
        followerId: number,
        username: string,
    ): Promise<ProfileRO> {
        const followed: UserEntity = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        if (!followed)
            throw new BadRequestException({ message: 'Invalid username' });

        const follower: UserEntity = new UserEntity();
        follower.id = followerId;

        const following: FollowingEntity = new FollowingEntity();
        following.followed = followed;
        following.follower = follower;

        await this.followingRepository.save(following);

        return this.buildProfileRO(followed, true);
    }

    async unfollowProfile(
        followerId: number,
        username: string,
    ): Promise<ProfileRO> {
        const followed: UserEntity = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        if (!followed)
            throw new BadRequestException({ message: 'Invalid username' });

        await this.followingRepository
            .createQueryBuilder()
            .delete()
            .where('followerId = :followerId', { followerId })
            .andWhere('followedId = :followedId', { followedId: followed.id })
            .execute();

        return this.buildProfileRO(followed, false);
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
