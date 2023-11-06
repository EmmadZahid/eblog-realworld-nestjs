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
import { FindArticleQueryDto } from './dto/find-article-query-dto';
import { PageConfigDto } from './dto/page-config.dto';

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

    async getArticles(
        currentUser: UserEntity,
        query: FindArticleQueryDto,
    ): Promise<ArticlesRO> {
        const qb: SelectQueryBuilder<ArticleEntity> = this.articleRepository
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')
            .where('1 = 1');

        if (query.tag) {
            qb.andWhere('articles.tagList like :tag', {
                tag: `%${query.tag}%`,
            });
        }

        if (query.author) {
            qb.andWhere('author.username = :name', {
                name: query.author,
            });
        }

        if (query.favorited) {
            const favorited: UserEntity = await this.userRepository.findOne({
                where: { username: query.favorited },
                relations: ['favoriteArticles'],
            });
            if (favorited) {
                const articleIds: number[] = favorited.favoriteArticles.map(
                    (article) => article.id,
                );
                qb.andWhere('articles.id in (:articleIds)', { articleIds });
            }
        }

        const articlesCount: number = await qb.getCount();

        let offset: number = 0;
        if (query.offset) offset = Math.max(query.offset, 0);

        let limit: number = 20;
        if (query.limit) limit = Math.max(query.limit, 1);

        const searchedArticles: ArticleEntity[] = await qb
            .offset(offset)
            .limit(limit)
            .orderBy('createdAt', 'DESC')
            .getMany();

        let favoriteArticleIds: number[] = [];
        let followedIds: number[] = [];

        //If the user is logged in then we have to populate the favorited and following properties
        if (currentUser) {
            favoriteArticleIds = await this.checkIfArticleIsFavourite(
                currentUser,
                searchedArticles,
            );
            followedIds = await this.checkIfAuthorIsFollowedByCurrentUser(
                currentUser,
                searchedArticles,
            );
        }

        return this.buildArticlesRO(
            searchedArticles,
            articlesCount,
            followedIds,
            favoriteArticleIds,
        );
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

        if (!article) throw new NotFoundException({ message: 'Not found' });
        const followedIds: number[] =
            await this.profileService.doesFollowProfiles(currentUser.id, [
                article.author.id,
            ]);

        return this.buildArticleRO(
            article,
            followedIds.length > 0 ? true : false,
        );
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

        const followedIds: number[] =
            await this.profileService.doesFollowProfiles(currentUser.id, [
                favoriteArticle.author.id,
            ]);

        const isNewFavorite: boolean =
            user.favoriteArticles.findIndex((article) => article.slug == slug) <
            0;

        if (isNewFavorite) {
            favoriteArticle.favoritesCount++;
            await this.articleRepository.save(favoriteArticle);

            user.favoriteArticles = [...user.favoriteArticles, favoriteArticle];
            await this.userRepository.save(user);
        }

        return this.buildArticleRO(
            favoriteArticle,
            followedIds.length > 0 ? true : false,
            true,
        );
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

        const followedIds: number[] =
            await this.profileService.doesFollowProfiles(currentUser.id, [
                favoriteArticle.author.id,
            ]);
        const isFavorite: boolean =
            user.favoriteArticles.findIndex((article) => article.slug == slug) >
            -1;

        if (isFavorite) {
            favoriteArticle.favoritesCount--;
            await this.articleRepository.save(favoriteArticle);

            const favoriteArticles: ArticleEntity[] =
                user.favoriteArticles.filter((article) => article.slug != slug);
            user.favoriteArticles = [...favoriteArticles];
            await this.userRepository.save(user);
        }

        return this.buildArticleRO(
            favoriteArticle,
            followedIds.length > 0 ? true : false,
            false,
        );
    }

    async getFeed(currentUser: UserEntity, query: PageConfigDto) {
        const followedAuthorIds: number[] =
            await this.profileService.getFollowedAuthorIds(currentUser.id);

        if (!followedAuthorIds.length) {
            return this.buildArticlesRO([], 0);
        }

        let offset: number = 0;
        if (query.offset) offset = Math.max(query.offset, 0);

        let limit: number = 20;
        if (query.limit) limit = Math.max(query.limit, 1);

        let selectQuery: SelectQueryBuilder<ArticleEntity> =
            await this.articleRepository
                .createQueryBuilder('articles')
                .where('articles.authorId IN (:...ids)', {
                    ids: followedAuthorIds,
                });
        const articlesCount: number = await selectQuery.getCount();

        const articles: ArticleEntity[] = await selectQuery
            .leftJoinAndSelect('articles.author', 'author')
            .offset(offset)
            .limit(limit)
            .orderBy('updatedAt', 'DESC') //Check what if the article is not updated
            .getMany();

        let favoriteArticleIds: number[] = await this.checkIfArticleIsFavourite(
            currentUser,
            articles,
        );
        let followedIds: number[] =
            await this.checkIfAuthorIsFollowedByCurrentUser(
                currentUser,
                articles,
            );

        return this.buildArticlesRO(
            articles,
            articlesCount,
            followedIds,
            favoriteArticleIds,
        );
    }

    private buildArticlesRO(
        entities: ArticleEntity[],
        articlesCount,
        followedAuthorIds: number[] = [],
        favoriteArticleIds: number[] = [],
    ): ArticlesRO {
        const articles: Article[] = entities.map((entity) => {
            return {
                title: entity.title,
                description: entity.description,
                body: entity.body,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
                favorited: favoriteArticleIds.includes(entity.id),
                favoritesCount: entity.favoritesCount,
                slug: entity.slug,
                tagList: entity.tagList,
                author: {
                    bio: entity.author.bio,
                    image: entity.author.image,
                    username: entity.author.username,
                    following: followedAuthorIds.includes(entity.author.id), //TODO
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

    private async checkIfArticleIsFavourite(
        currentUser: UserEntity,
        articles: ArticleEntity[],
    ): Promise<number[]> {
        const articleIds: number[] = articles.map((article) => article.id);
        const currentUserWithFavoriteArticles: UserEntity =
            await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.favoriteArticles', 'favoriteArticles')
                .where('user.id = :userId', { userId: currentUser.id })
                .andWhere('favoriteArticles.id in (:articleIds)', {
                    articleIds,
                })
                .getOne();

        let favoriteArticleIds: number[] = [];
        if (currentUserWithFavoriteArticles)
            favoriteArticleIds =
                currentUserWithFavoriteArticles.favoriteArticles.map(
                    (article) => article.id,
                );
        return favoriteArticleIds;
    }

    private async checkIfAuthorIsFollowedByCurrentUser(
        currentUser: UserEntity,
        articles: ArticleEntity[],
    ): Promise<number[]> {
        //Does follow
        const uniqueAuthorIds: number[] = [
            ...new Set(articles.map((article) => article.author.id)),
        ];

        let followedIds: number[] =
            (await this.profileService.doesFollowProfiles(
                currentUser.id,
                uniqueAuthorIds,
            )) || [];

        return followedIds;
    }
}
