import { Profile } from "src/profile/profile.interface"

export interface Article{
    slug: string
    title: string
    description: string
    body: string
    tagList: string[]
    createdAt: Date
    updatedAt: Date
    favorited: boolean
    favoritesCount: number
    author: Profile
}

export interface ArticleRO{
    article: Article
}

export interface ArticlesRO{
    articles: Article[]
}