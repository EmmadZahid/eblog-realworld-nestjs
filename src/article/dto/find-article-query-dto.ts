import { PageConfigDto } from './page-config.dto';

export class FindArticleQueryDto extends PageConfigDto {
    tag?: string;
    author?: string;
    favorited?: string;
}
