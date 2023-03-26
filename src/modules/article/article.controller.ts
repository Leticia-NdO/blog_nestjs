import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '../user/decorators/user.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { UserEntity } from '../user/user.entity';
import { ArticleService } from './article.service';
import { ListAllArticlesUseCase } from './core/data/list-all-by-user-use-case';
import { ListOwnArticlesUseCase } from './core/data/list-own-articles-use-case';
import { PersistArticleDto } from './dto/persist-article.dto';
import { ArticleBulkResponseInterface } from './types/article-bulk-response.interface';
import { ArticleQueries } from './types/article-queries.interface';
import { ArticleResponseInterface } from './types/article-response.interface';

@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly listAllUseCase: ListAllArticlesUseCase,
    private readonly listOwnArticlesUseCase: ListOwnArticlesUseCase,
  ) {}

  @Get()
  async findAll(
    @User('id') userId: number,
    @Query() queries: ArticleQueries,
  ): Promise<ArticleBulkResponseInterface> {
    // return await this.articleService.findAll(userId, queries);
    return await this.listAllUseCase.findAll(userId, queries);
  }

  @Get('my-articles')
  async getOwnArticles(
    @User('id') userId: number,
    @Query() queries: ArticleQueries,
  ): Promise<ArticleBulkResponseInterface> {
    //  return await this.articleService.getOwnArticles(userId, queries);
    return await this.listOwnArticlesUseCase.findAll(userId, queries);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') userId: number,
    @Query() queries: ArticleQueries,
  ): Promise<ArticleBulkResponseInterface> {
    return await this.articleService.getFeed(userId, queries);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async createArticle(
    @User() author: UserEntity,
    @Body('article') persistArticleDto: PersistArticleDto,
  ): Promise<ArticleResponseInterface> {
    const articleEntity = await this.articleService.createArticle(
      author,
      persistArticleDto,
    );

    return this.articleService.buildArticleResponse(articleEntity);
  }

  @Get(':slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const articleEntity = await this.articleService.loadArticleBySlug(slug);
    return this.articleService.buildArticleResponse(articleEntity);
  }

  @Delete(':slug')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async deleteArticleBySlug(
    @Param('slug') slug: string,
    @User('id') userId: number,
  ): Promise<void> {
    await this.articleService.deleteArticleBySlug(userId, slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  async updateArticleBySlug(
    @Param('slug') slug: string,
    @User('id') userId: number,
    @Body('article') updateArticleDto: PersistArticleDto,
  ): Promise<ArticleResponseInterface> {
    const articleEntity = await this.articleService.updateArticleBySlug(
      userId,
      slug,
      updateArticleDto,
    );
    return this.articleService.buildArticleResponse(articleEntity);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async likeArticle(
    @Param('slug') slug: string,
    @User('id') userId: number,
  ): Promise<ArticleResponseInterface> {
    const articleEntity = await this.articleService.likeArticle(userId, slug);

    return this.articleService.buildArticleResponse(articleEntity);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async dislikeArticle(
    @Param('slug') slug: string,
    @User('id') userId: number,
  ): Promise<ArticleResponseInterface> {
    const articleEntity = await this.articleService.dislikeArticle(
      userId,
      slug,
    );

    return this.articleService.buildArticleResponse(articleEntity);
  }
}