import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.interface';
import { TagsRO } from 'src/tag/tag.interface';
import { TagService } from 'src/tag/tag.service';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { Article, ArticleRO } from './article.interface';
import { ArticleDto, UpdateArticleDto } from './dto';
import { difference } from 'lodash';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity) private articleRepository:Repository<ArticleEntity>,
        private tagService:TagService,
        private profileService:ProfileService
    ){}
    
    async createArticle(currentUser:UserEntity, dto:ArticleDto): Promise<ArticleRO>{
        const article:ArticleEntity = new ArticleEntity()
        article.title = dto.title
        article.body = dto.body
        article.description = dto.description
        article.slug = this.slugify(dto.title)
        article.author = currentUser
        article.tagList = dto.tagList

        const tags:TagsRO = await this.tagService.getAllTags()

        const tagsToAdd:string[] = difference(dto.tagList, tags.tags)

        await this.tagService.bulkCreate(tagsToAdd)

        const savedArticle:ArticleEntity = await this.articleRepository.save(article)
        return this.buildArticleRO(savedArticle)
    }

    async getArticle(currentUser:UserEntity, slug:string): Promise<ArticleRO>{
        const article:ArticleEntity = await this.articleRepository.findOne({
            where:{
                slug
            },
            relations: ['author']
        })

        const following:boolean = await this.profileService.doesFollowProfile(currentUser.id, article.author.id)

        return this.buildArticleRO(article, following)
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
        
        return this.buildArticleRO(freshArticle)
    }

    async deleteArticle(currentUser:UserEntity, slug:string){
        const toDelete:ArticleEntity = await this.articleRepository.findOne({
            where:{
                slug
            },
            relations:["author"]
        })
        
        if(!toDelete)
            throw new NotFoundException({message: "Not found"})

        if(toDelete.author.id != currentUser.id)
            throw new ForbiddenException({message: "You dont have permission to delete it"})
        
        await this.articleRepository.delete({id: toDelete.id})
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
            tagList: entity.tagList,
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