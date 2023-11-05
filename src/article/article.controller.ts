import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { GetUser } from 'src/user/decorator/user.decorator';
import { UserEntity } from 'src/user/user.entity';
import { ArticleRO, ArticlesRO } from './article.interface';
import { ArticleService } from './article.service';
import { ArticleDto, UpdateArticleDto } from './dto';

@Controller('articles')
export class ArticleController {
    constructor(private articleService: ArticleService) {}

    @Post()
    createArticle(
        @GetUser() currentUser: UserEntity,
        @Body('article') dto: ArticleDto,
    ): Promise<ArticleRO> {
        return this.articleService.createArticle(currentUser, dto);
    }

    @Get('feed')
    getFeed(
        @GetUser('id', ParseIntPipe) currentUserId: number,
        @Query('limit', ParseIntPipe) limit: number = 0,
        @Query('offset', ParseIntPipe) offset: number = 5,
    ): Promise<ArticlesRO> {
        return this.articleService.getFeed(currentUserId, limit, offset);
    }

    @Get(':slug')
    getArticle(
        @Param('slug') slug: string,
        @GetUser() currentUser: UserEntity,
    ): Promise<ArticleRO> {
        return this.articleService.getArticle(currentUser, slug);
    }

    @Put(':slug')
    updateArticle(
        @Param('slug') slug: string,
        @GetUser() currentUser: UserEntity,
        @Body('article') dto: UpdateArticleDto,
    ): Promise<ArticleRO> {
        return this.articleService.updateArticle(currentUser, slug, dto);
    }

    @Delete(':slug')
    deleteArticle(
        @Param('slug') slug: string,
        @GetUser() currentUser: UserEntity,
    ) {
        this.articleService.deleteArticle(currentUser, slug);
    }

    @Post(':slug/favorite')
    favoriteArticle(
        @Param('slug') slug: string,
        @GetUser() currentUser: UserEntity,
    ): Promise<ArticleRO> {
        return this.articleService.favoriteArticle(currentUser, slug);
    }

    @Delete(':slug/favorite')
    unfavoriteArticle(
        @Param('slug') slug: string,
        @GetUser() currentUser: UserEntity,
    ): Promise<ArticleRO> {
        return this.articleService.unfavoriteArticle(currentUser, slug);
    }
}
