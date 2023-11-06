import { UserEntity } from 'src/user/user.entity';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'articles' })
export class ArticleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    slug: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column() //TODO: increase size of body
    body: string;

    @Column()
    createdAt: Date;
    @BeforeInsert()
    assignCreationDate() {
        this.createdAt = new Date();
    }

    @Column({ nullable: true })
    updatedAt: Date;

    @ManyToOne(() => UserEntity)
    @JoinColumn({
        name: 'authorId',
    })
    author: UserEntity;

    @Column({ default: 0 })
    favoritesCount: number;

    @Column('simple-array')
    tagList: string[]; //The tag should not have ',' inside the word
}
