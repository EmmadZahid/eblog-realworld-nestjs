import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.interface';
import { TagsRO } from 'src/tag/tag.interface';
import { TagService } from 'src/tag/tag.service';
import { UserEntity } from 'src/user/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { Article, ArticleRO, ArticlesRO } from './article.interface';
import { ArticleDto, UpdateArticleDto } from './dto';
import { difference } from 'lodash';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private tagService: TagService,
        private profileService: ProfileService,
    ) {}

    async createArticle(
        currentUser: UserEntity,
        dto: ArticleDto,
    ): Promise<ArticleRO> {
        const article: ArticleEntity = new ArticleEntity();
        article.title = dto.title;
        article.body = dto.body;
        article.description = dto.description;
        article.slug = this.slugify(dto.title);
        article.author = currentUser;
        article.tagList = dto.tagList;

        const tags: TagsRO = await this.tagService.getAllTags();

        const tagsToAdd: string[] = difference(dto.tagList, tags.tags);

        await this.tagService.bulkCreate(tagsToAdd);

        const savedArticle: ArticleEntity =
            await this.articleRepository.save(article);
        return this.buildArticleRO(savedArticle);
    }

    async getArticle(
        currentUser: UserEntity,
        slug: string,
    ): Promise<ArticleRO> {
        const article: ArticleEntity = await this.articleRepository.findOne({
            where: {
                slug,
            },
            relations: {
                author: true,
            },
        });

        const following: boolean = await this.profileService.doesFollowProfile(
            currentUser.id,
            article.author.id,
        );

        return this.buildArticleRO(article, following);
    }

    async updateArticle(
        currentUser: UserEntity,
        slug: string,
        dto: UpdateArticleDto,
    ): Promise<ArticleRO> {
        const toUpdate: ArticleEntity = await this.articleRepository
            .createQueryBuilder('articles')
            .where('articles.slug = :slug', { slug })
            .andWhere('articles.authorId = :id', { id: currentUser.id })
            .getOne();

        if (!toUpdate) throw new NotFoundException({ message: 'Not found' });

        if (dto.title && toUpdate.title != dto.title) {
            toUpdate.title = dto.title;
            toUpdate.slug = this.slugify(dto.title);
        }

        if (dto.body) toUpdate.body = dto.body;
        if (dto.description) toUpdate.description = dto.description;

        toUpdate.updatedAt = new Date();
        //TODO:The updatedArticle does not have the user object so I am fetching the fresh artcile. Need to investigate why
        // eslint-disable-next-line
        const updatedArticle: ArticleEntity = await this.articleRepository.save(
            toUpdate,
            { reload: true },
        );
        const freshArticle: ArticleEntity =
            await this.articleRepository.findOne({
                where: {
                    id: toUpdate.id,
                },
                relations: ['author'],
            });

        return this.buildArticleRO(freshArticle);
    }

    async deleteArticle(currentUser: UserEntity, slug: string) {
        const toDelete: ArticleEntity = await this.articleRepository.findOne({
            where: {
                slug,
            },
            relations: ['author'],
        });

        if (!toDelete) throw new NotFoundException({ message: 'Not found' });

        if (toDelete.author.id != currentUser.id)
            throw new ForbiddenException({
                message: 'You dont have permission to delete it',
            });

        await this.articleRepository.delete({ id: toDelete.id });
    }

    async favoriteArticle(currentUser: UserEntity, slug: string) {
        const user: UserEntity = await this.userRepository.findOne({
            where: {
                id: currentUser.id,
            },
            relations: ['favoriteArticles'],
        });

        let favoriteArticle: ArticleEntity =
            await this.articleRepository.findOne({
                where: {
                    slug,
                },
                relations: ['author'],
            });

        if (!favoriteArticle)
            throw new NotFoundException({ message: 'Article not found' });

        const following: boolean = await this.profileService.doesFollowProfile(
            currentUser.id,
            favoriteArticle.author.id,
        );
        const isNewFavorite: boolean =
            user.favoriteArticles.findIndex((article) => article.slug == slug) <
            0;

        if (isNewFavorite) {
            favoriteArticle.favoritesCount++;
            await this.articleRepository.save(favoriteArticle);

            user.favoriteArticles = [...user.favoriteArticles, favoriteArticle];
            await this.userRepository.save(user);
        }

        return this.buildArticleRO(favoriteArticle, following, true);
    }

    async unfavoriteArticle(currentUser: UserEntity, slug: string) {
        const user: UserEntity = await this.userRepository.findOne({
            where: {
                id: currentUser.id,
            },
            relations: ['favoriteArticles'],
        });

        let favoriteArticle: ArticleEntity =
            await this.articleRepository.findOne({
                where: {
                    slug,
                },
                relations: ['author'],
            });

        if (!favoriteArticle)
            throw new NotFoundException({ message: 'Article not found' });

        const following: boolean = await this.profileService.doesFollowProfile(
            currentUser.id,
            favoriteArticle.author.id,
        );
        const isFavorite: boolean =
            user.favoriteArticles.findIndex((article) => article.slug == slug) >
            -1;
        console.log(isFavorite);
        if (isFavorite) {
            console.log(isFavorite);
            favoriteArticle.favoritesCount--;
            await this.articleRepository.save(favoriteArticle);

            const favoriteArticles: ArticleEntity[] =
                user.favoriteArticles.filter((article) => article.slug != slug);
            user.favoriteArticles = [...favoriteArticles];
            await this.userRepository.save(user);
        }

        return this.buildArticleRO(favoriteArticle, following, false);
    }

    async getFeed(currentUserId: number, limit: number, offset: number) {
        const followedAuthorIds: number[] =
            await this.profileService.getFollowedAuthorIds(currentUserId);

        if (!followedAuthorIds.length) {
            return this.buildArticlesRO([], 0);
        }

        limit = Math.max(limit, 5);
        offset = Math.max(offset, 0);

        let selectQuery: SelectQueryBuilder<ArticleEntity> =
            await this.articleRepository
                .createQueryBuilder('articles')
                .where('articles.authorId IN (:...ids)', {
                    ids: followedAuthorIds,
                });
        const articlesCount: number = await selectQuery.getCount();

        const articles: ArticleEntity[] = await selectQuery
            .leftJoinAndSelect('articles.author', 'author')
            .limit(limit)
            .skip(offset)
            .orderBy('updatedAt', 'DESC')
            .getMany();

        return this.buildArticlesRO(articles, articlesCount);
    }

    private buildArticlesRO(
        entities: ArticleEntity[],
        articlesCount,
    ): ArticlesRO {
        const articles: Article[] = entities.map((entity) => {
            return {
                title: entity.title,
                description: entity.description,
                body: entity.body,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
                favorited: false,
                favoritesCount: entity.favoritesCount,
                slug: entity.slug,
                tagList: entity.tagList,
                author: {
                    bio: entity.author.bio,
                    image: entity.author.image,
                    username: entity.author.username,
                    following: true,
                } as Profile,
            };
        });

        return {
            articles,
            articlesCount,
        } as ArticlesRO;
    }

    private buildArticleRO(
        entity: ArticleEntity,
        following: boolean = false,
        favorited: boolean = false,
    ): ArticleRO {
        const article: Article = {
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
                following,
            } as Profile,
        };

        return {
            article,
        };
    }

    private slugify(title: string): string {
        return (
            title.split(' ').join('-').toLowerCase() +
            '-' +
            ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
        );
    }
}
