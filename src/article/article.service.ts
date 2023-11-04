import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.interface';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { Article, ArticleRO } from './article.interface';
import { ArticleDto, UpdateArticleDto } from './dto';

@Injectable()
export class ArticleService {
    constructor(@InjectRepository(ArticleEntity) private articleRepository:Repository<ArticleEntity>){}
    
    async createArticle(currentUser:UserEntity, dto:ArticleDto): Promise<ArticleRO>{
        const article:ArticleEntity = new ArticleEntity()
        article.title = dto.title
        article.body = dto.body
        article.description = dto.description
        article.slug = this.slugify(dto.title)
        article.author = currentUser

        const savedArticle:ArticleEntity = await this.articleRepository.save(article)
        return this.buildArticleRO(savedArticle)
    }

    async updateArticle(currentUser:UserEntity, slug:string, dto:UpdateArticleDto): Promise<ArticleRO>{
        const toUpdate:ArticleEntity = await this.articleRepository.createQueryBuilder('articles')
        .where('articles.slug = :slug',{slug})
        .andWhere('articles.authorId = :id',{id: currentUser.id})
        .getOne()
        
        if(!toUpdate)
            throw new NotFoundException({message: "Not found"})

        if(dto.title && toUpdate.title != dto.title){
            toUpdate.title = dto.title
            toUpdate.slug = this.slugify(dto.title)
        }

        if(dto.body)
            toUpdate.body = dto.body
        if(dto.description)
            toUpdate.description = dto.description

        //TODO:The updatedArticle does not have the user object so I am fetching the fresh artcile. Need to investigate why
        const updatedArticle:ArticleEntity = await this.articleRepository.save(toUpdate,{reload: true})
        const freshArticle:ArticleEntity = await this.articleRepository.findOne(
            {
                where:{
                    id: toUpdate.id
                },
                relations:["author"]
            }
        )
        console.log(freshArticle);
        
        return this.buildArticleRO(freshArticle)
    }

    private buildArticleRO(entity:ArticleEntity, following:boolean = false, favorited:boolean = false):ArticleRO{
        const article:Article = {
            title: entity.title,
            description: entity.description,
            body: entity.body,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            favorited,
            favoritesCount: entity.favoritesCount,
            slug: entity.slug,
            tagList: [],
            author: {
                bio: entity.author.bio,
                image: entity.author.image,
                username: entity.author.username,
                following
            } as Profile
        }

        return {
            article
        }
    }

    private slugify(title:string): string{
        return title.split(' ').join('-').toLowerCase() + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
    }
}