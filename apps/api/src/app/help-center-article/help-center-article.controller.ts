import { HelpCenterArticle } from './help-center-article.entity';
import { IHelpCenter, PermissionsEnum } from '@gauzy/models';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
	Controller,
	HttpStatus,
	Post,
	Body,
	UseGuards,
	Get,
	Param
} from '@nestjs/common';
import { CrudController } from '../core';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from '../shared/decorators/permissions';
import { PermissionGuard } from '../shared/guards/auth/permission.guard';
import { HelpCenterArticleService } from './help-center-article.service';

@ApiTags('knowledge_base_article')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class HelpCenterArticleController extends CrudController<
	HelpCenterArticle
> {
	constructor(private readonly helpCenterService: HelpCenterArticleService) {
		super(helpCenterService);
	}

	@ApiOperation({
		summary: 'Create new article'
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Success Add article',
		type: HelpCenterArticle
	})
	@UseGuards(PermissionGuard)
	@Permissions(PermissionsEnum.ORG_HELP_CENTER_EDIT)
	@Post()
	async createNode(@Body() entity: IHelpCenter): Promise<any> {
		return this.helpCenterService.create(entity);
	}

	@ApiOperation({
		summary: 'Find articles By Category Id.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found category articles',
		type: HelpCenterArticle
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@UseGuards(PermissionGuard)
	@Get(':categoryId')
	async findByCategoryId(
		@Param('categoryId') categoryId: string
	): Promise<HelpCenterArticle[]> {
		return this.helpCenterService.getArticlesByCategoryId(categoryId);
	}
}
