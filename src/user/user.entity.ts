import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as argon from 'argon2';

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
}
