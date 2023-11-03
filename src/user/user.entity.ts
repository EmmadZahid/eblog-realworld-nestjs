import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'users'})
export class UserEntity{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column({length: 100})
    username: string

    @Column({default: ''})
    bio: string

    @Column({nullable: true})
    image: string

    @Column({nullable: false})
    password: string

}