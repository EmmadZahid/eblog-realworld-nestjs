import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from './tag.entity';
import { TagsRO } from './tag.interface';

@Injectable()
export class TagService {
    constructor(@InjectRepository(TagEntity) private tagRepository:Repository<TagEntity>){}

    async bulkCreate(tags:string[]){
        const tagEntities:TagEntity[] = []
        tags.forEach( tag =>{
            const tagEntity:TagEntity = new TagEntity()
            tagEntity.tag = tag
            tagEntities.push(tagEntity)
        })
        await this.tagRepository.save(tagEntities)
    }

    async getAllTags():Promise<TagsRO>{
        let tags:TagEntity[] = await this.tagRepository.find() || []
        let tagNames:string[] = tags.map( tag => tag.tag) || []
        return {
            tags: tagNames
        } as TagsRO
    }
}
