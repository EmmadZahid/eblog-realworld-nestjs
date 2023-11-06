import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { GetUser } from 'src/user/decorator/user.decorator';
import { UserEntity } from 'src/user/user.entity';
import { ArticleRO, ArticlesRO } from './article.interface';
import { ArticleService } from './article.service';
import { CommentRO, CommentsRO } from './comment.interface';
import { ArticleDto, UpdateArticleDto } from './dto';
import { CommentDto } from './dto/comment.dto';
import { FindArticleQueryDto } from './dto/find-article-query-dto';
import { PageConfigDto } from './dto/page-config.dto';

@Controller('articles')
export class ArticleController {
    constructor(private articleService: ArticleService) {}

    @Get()
    getArticles(@GetUser() currentUser: UserEntity, @Query() query: FindArticleQueryDto): Promise<ArticlesRO> {
        return this.articleService.getArticles(currentUser, query);
    }

    @Post()
    createArticle(@GetUser() currentUser: UserEntity, @Body('article') dto: ArticleDto): Promise<ArticleRO> {
        return this.articleService.createArticle(currentUser, dto);
    }

    @Get('feed')
    getFeed(@GetUser() currentUser: UserEntity, @Query() query: PageConfigDto): Promise<ArticlesRO> {
        return this.articleService.getFeed(currentUser, query);
    }

    @Get(':slug')
    getArticle(@Param('slug') slug: string, @GetUser() currentUser: UserEntity): Promise<ArticleRO> {
        console.log('asdsa');

        return this.articleService.getArticle(currentUser, slug);
    }

    @Put(':slug')
    updateArticle(@Param('slug') slug: string, @GetUser() currentUser: UserEntity, @Body('article') dto: UpdateArticleDto): Promise<ArticleRO> {
        return this.articleService.updateArticle(currentUser, slug, dto);
    }

    @Delete(':slug')
    deleteArticle(@Param('slug') slug: string, @GetUser() currentUser: UserEntity) {
        this.articleService.deleteArticle(currentUser, slug);
    }

    @Post(':slug/favorite')
    favoriteArticle(@Param('slug') slug: string, @GetUser() currentUser: UserEntity): Promise<ArticleRO> {
        return this.articleService.favoriteArticle(currentUser, slug);
    }

    @Delete(':slug/favorite')
    unfavoriteArticle(@Param('slug') slug: string, @GetUser() currentUser: UserEntity): Promise<ArticleRO> {
        return this.articleService.unfavoriteArticle(currentUser, slug);
    }

    @Post(':slug/comments')
    addComment(@Param('slug') slug: string, @GetUser() currentUser: UserEntity, @Body('comment') dto: CommentDto): Promise<CommentRO> {
        return this.articleService.addComment(currentUser, slug, dto);
    }

    @Get(':slug/comments')
    getComment(@Param('slug') slug: string, @GetUser() currentUser: UserEntity): Promise<CommentsRO> {
        return this.articleService.getComments(currentUser, slug);
    }
}
