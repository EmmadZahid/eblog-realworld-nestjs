import { UserEntity } from 'src/user/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ArticleEntity } from './article.entity';

@Entity({ name: 'comments' })
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    body: string;

    @Column()
    createdAt: Date;
    @BeforeInsert()
    assignCreationDate() {
        this.createdAt = new Date();
    }

    @Column({ nullable: true })
    updatedAt: Date;

    @BeforeUpdate()
    assignUpdatedDate() {
        this.updatedAt = new Date();
    }

    @OneToOne(() => UserEntity)
    @JoinColumn({
        name: 'authorId',
    })
    author: UserEntity;

    @ManyToOne(() => ArticleEntity, (article) => article.comments)
    article: ArticleEntity;
}
