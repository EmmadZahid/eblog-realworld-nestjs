import { UserEntity } from 'src/user/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('followings')
export class FollowingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'followedId' }) //just as an example
    followed: UserEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    follower: UserEntity;
}
