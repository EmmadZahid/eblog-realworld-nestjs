import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as argon from 'argon2';
import { ArticleEntity } from 'src/article/article.entity';

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column() //TODO: add unique
    email: string;

    @Column({ length: 100 }) //TODO: add unique
    username: string;

    @Column({ default: '' })
    bio: string;

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: false })
    password: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await argon.hash(this.password);
    }

    @ManyToMany(() => ArticleEntity)
    @JoinTable()
    favoriteArticles: ArticleEntity[];
}
