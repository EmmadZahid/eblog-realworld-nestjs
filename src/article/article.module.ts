import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from 'src/profile/profile.module';
import { TagModule } from 'src/tag/tag.module';
import { AuthMiddleware } from 'src/user/auth.middleware';
import { UserEntity } from 'src/user/user.entity';
import { ArticleController } from './article.controller';
import { ArticleEntity } from './article.entity';
import { ArticleService } from './article.service';

@Module({
    imports: [
        TagModule,
        ProfileModule,
        TypeOrmModule.forFeature([UserEntity, ArticleEntity]),
    ],
    controllers: [ArticleController],
    providers: [ArticleService],
})
export class ArticleModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(
                { path: 'articles', method: RequestMethod.POST },
                { path: 'articles/:slug', method: RequestMethod.PUT },
                { path: 'articles/:slug', method: RequestMethod.DELETE },
                { path: 'articles/:slug', method: RequestMethod.GET },
                { path: 'articles/feed', method: RequestMethod.GET },
                { path: 'articles/:slug/favorite', method: RequestMethod.POST },
                {
                    path: 'articles/:slug/favorite',
                    method: RequestMethod.DELETE,
                },
            );
    }
}
