import {
	EmployeeCreateInput as IEmployeeCreateInput,
	PermissionsEnum,
	LanguagesEnum
} from '@gauzy/models';
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EmployeeCreateCommand, EmployeeBulkCreateCommand } from './commands';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IPagination, getUserDummyImage } from '../core';
import { CrudController } from '../core/crud/crud.controller';
import { Permissions } from '../shared/decorators/permissions';
import { PermissionGuard } from '../shared/guards/auth/permission.guard';
import { Employee } from './employee.entity';
import { EmployeeService } from './employee.service';
import { ParseJsonPipe } from '../shared';
import { I18nLang } from 'nestjs-i18n';

@ApiTags('Employee')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class EmployeeController extends CrudController<Employee> {
	constructor(
		private readonly employeeService: EmployeeService,
		private readonly commandBus: CommandBus
	) {
		super(employeeService);
	}

	@ApiOperation({ summary: 'Update an existing record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully edited.'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Put(':id')
	async update(
		@Param('id') id: string,
		@Body() entity: Employee
	): Promise<any> {
		//We are using create here because create calls the method save()
		//We need save() to save ManyToMany relations
		try {
			return this.employeeService.create({
				id,
				...entity
			});
		} catch (error) {
			console.log(error);
			return;
		}
	}

	@ApiOperation({ summary: 'Find all employees in the same tenant.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found employees in the tenant',
		type: Employee
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get()
	async findAllEmployees(
		@Query('data') data: string
	): Promise<IPagination<Employee>> {
		const { relations, findInput } = JSON.parse(data);
		return this.employeeService.findAll({ where: findInput, relations });
	}

	@ApiOperation({ summary: 'Find all working employees.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found working employees',
		type: Employee
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('/working')
	async findAllWorkingEmployees(
		@Query('data') data: string
	): Promise<IPagination<Employee>> {
		const { organizationId, forMonth = new Date(), withUser } = JSON.parse(
			data
		);
		return this.employeeService.findWorkingEmployees(
			organizationId,
			new Date(forMonth),
			withUser
		);
	}

	@ApiOperation({ summary: 'Find employee by id in the same tenant.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found employee in the same tenant',
		type: Employee
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get(':id')
	async findById(
		@Param('id') id: string,
		@Query('data', ParseJsonPipe) data?: any
	): Promise<Employee> {
		const { relations = [], useTenant } = data;

		if (useTenant) {
			return this.employeeService.findOne(id, {
				relations
			});
		} else {
			return this.employeeService.findWithoutTennant(id, {
				relations
			});
		}
	}

	@ApiOperation({ summary: 'Create new record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.' /*, type: T*/
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@UseGuards(PermissionGuard)
	@Permissions(PermissionsEnum.ORG_EMPLOYEES_EDIT)
	@Post('/create')
	async create(
		@Body() entity: IEmployeeCreateInput,
		...options: any[]
	): Promise<Employee> {
		return this.commandBus.execute(new EmployeeCreateCommand(entity));
	}

	@ApiOperation({ summary: 'Create records in Bulk' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Records have been successfully created.' /*, type: T*/
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@UseGuards(PermissionGuard)
	@Permissions(PermissionsEnum.ORG_EMPLOYEES_EDIT)
	@Post('/createBulk')
	async createBulk(
		@Body() input: IEmployeeCreateInput[],
		@I18nLang() languageCode: LanguagesEnum,
		...options: any[]
	): Promise<Employee[]> {
		/**
		 * Use a dummy image avatar if no image is uploaded for any of the employees in the list
		 */

		input
			.filter((entity) => !entity.user.imageUrl)
			.map(
				(entity) =>
					(entity.user.imageUrl = getUserDummyImage(entity.user))
			);

		return this.commandBus.execute(
			new EmployeeBulkCreateCommand(input, languageCode)
		);
	}
}
