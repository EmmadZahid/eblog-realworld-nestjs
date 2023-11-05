import { UserEntity } from 'src/user/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('followers')
export class FollowerEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({
        referencedColumnName: 'id',
        name: 'userId',
        foreignKeyConstraintName: 'fk_userId',
    })
    userId: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({
        referencedColumnName: 'id',
        name: 'followerId',
        foreignKeyConstraintName: 'fk_followerId',
    })
    followerId: number;
}
