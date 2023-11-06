export class ArticleDto {
    title: string;
    description: string;
    body: string;
    tagList: string[]; //The tag should not have ',' inside any tag word. Put validtion
}
