import { Profile } from 'src/profile/profile.interface';

export interface Comment {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    body: string;
    author: Profile;
}

export interface CommentRO {
    comment: Comment;
}

export interface CommentsRO {
    comments: Comment[];
}
