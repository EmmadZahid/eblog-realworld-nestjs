import { Body, Controller, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { GetUser } from 'src/user/decorator/user.decorator';
import { UserEntity } from 'src/user/user.entity';
import { ArticleRO } from './article.interface';
import { ArticleService } from './article.service';
import { ArticleDto, UpdateArticleDto } from './dto';

@Controller('articles')
export class ArticleController {
    constructor(private articleService:ArticleService){}

    @Post()
    createArticle(@GetUser() currentUser:UserEntity, @Body('article') dto:ArticleDto): Promise<ArticleRO>{
        return this.articleService.createArticle(currentUser, dto)
    }

    @Put(':slug')
    updateArticle(@Param('slug') slug:string, @GetUser() currentUser:UserEntity, @Body('article') dto:UpdateArticleDto): Promise<ArticleRO>{
        return this.articleService.updateArticle(currentUser, slug, dto)
    }
}
