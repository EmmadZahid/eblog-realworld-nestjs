import { Controller, Get } from '@nestjs/common';
import { TagsRO } from './tag.interface';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private tagService: TagService) {}
  @Get()
  getTags(): Promise<TagsRO> {
    return this.tagService.getAllTags();
  }
}
