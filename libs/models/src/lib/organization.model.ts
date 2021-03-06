import { BaseEntityModel as IBaseEntityModel } from './base-entity.model';
import { Location as ILocation } from './location.model';
import { ITenant, Tag, Skill } from '@gauzy/models';

export enum OrganizationPermissionsEnum {
	ALLOW_MANUAL_TIME = 'allowManualTime',
	ALLOW_MODIFY_TIME = 'allowModifyTime',
	ALLOW_DELETE_TIME = 'allowDeleteTime',
	ALLOW_FUTURE_DATE = 'futureDateAllowed'
}

export interface Organization extends IBaseEntityModel, ILocation {
	name: string;
	profile_link: string;
	valueDate?: Date;
	totalEmployees: number;
	status?: string;
	imageUrl?: string;
	banner: string;
	short_description: string;
	client_focus: string;
	show_income?: boolean;
	show_profits?: boolean;
	show_bonuses_paid?: boolean;
	show_total_hours?: boolean;
	show_minimum_project_size?: boolean;
	show_projects_count?: boolean;
	show_clients_count?: boolean;
	overview: string;
	skills: Skill[];
	currency: string;
	isActive: boolean;
	defaultValueDateType: string;
	defaultAlignmentType?: string;
	dateFormat?: string;
	brandColor?: string;
	timeZone?: string;
	officialName?: string;
	startWeekOn?: string;
	taxId?: string;
	numberFormat?: string;
	bonusType?: string;
	bonusPercentage?: number;
	tenant: ITenant;
	invitesAllowed?: boolean;
	inviteExpiryPeriod?: number;
	tags: Tag[];
	futureDateAllowed?: boolean;
	allowManualTime?: boolean;
	allowModifyTime?: boolean;
	allowDeleteTime?: boolean;
	requireReason?: boolean;
	requireDescription?: boolean;
	requireProject?: boolean;
	requireTask?: boolean;
	requireClient?: boolean;
	timeFormat?: 12 | 24;
	registrationDate?: Date;
}

export interface OrganizationFindInput extends IBaseEntityModel {
	name?: string;
	profile_link?: string;
	valueDate?: Date;
	imageUrl?: string;
	currency?: CurrenciesEnum;
	isActive?: boolean;
	skills?: Skill[];
	tags?: Tag[];
}

export interface OrganizationCreateInput extends ILocation {
	name: string;
	profile_link: string;
	valueDate?: Date;
	imageUrl: string;
	currency: CurrenciesEnum;
	client_focus: string;
	show_income?: boolean;
	show_profits?: boolean;
	show_bonuses_paid?: boolean;
	show_total_hours?: boolean;
	show_minimum_project_size?: boolean;
	show_projects_count?: boolean;
	show_clients_count?: boolean;
	defaultValueDateType: DefaultValueDateTypeEnum;
	dateFormat?: string;
	timeZone?: string;
	officialName?: string;
	startWeekOn?: string;
	taxId?: string;
	numberFormat?: string;
	bonusType: BonusTypeEnum;
	bonusPercentage?: number;
	invitesAllowed?: boolean;
	inviteExpiryPeriod?: number;
	tags?: Tag[];
	tenant: ITenant;
	skills?: Skill[];
}

export enum OrganizationSelectInput {
	id = 'id',
	name = 'name',
	profile_link = 'profile_link',
	valueDate = 'valueDate',
	imageUrl = 'imageUrl',
	currency = 'currency',
	createdAt = 'createdAt',
	updatedAt = 'updatedAt',
	isActive = 'isActive',
	tags = 'tags'
}

export enum RegionsEnum {
	'EN' = 'English (United States)',
	'BG' = 'Bulgarian (Bulgaria)',
	'HE' = 'Hebrew (Israel)',
	'RU' = 'Rusian (Russia)'
}

export enum CurrenciesEnum {
	USD = 'USD',
	BGN = 'BGN',
	ILS = 'ILS'
}

export enum DefaultValueDateTypeEnum {
	TODAY = 'TODAY',
	END_OF_MONTH = 'END_OF_MONTH',
	START_OF_MONTH = 'START_OF_MONTH'
}

export enum ProjectTypeEnum {
	RATE = 'RATE',
	FLAT_FEE = 'FLAT_FEE',
	MILESTONES = 'MILESTONES'
}

export enum AlignmentOptions {
	LEFT = 'LEFT',
	RIGHT = 'RIGHT',
	CENTER = 'CENTER'
}

export enum WeekDaysEnum {
	MONDAY = 'MONDAY',
	TUESDAY = 'TUESDAY',
	WEDNESDAY = 'WEDNESDAY',
	THURSDAY = 'THURSDAY',
	FRIDAY = 'FRIDAY',
	SATURDAY = 'SATURDAY',
	SUNDAY = 'SUNDAY'
}

export enum BonusTypeEnum {
	PROFIT_BASED_BONUS = 'PROFIT_BASED_BONUS',
	REVENUE_BASED_BONUS = 'REVENUE_BASED_BONUS'
}

export enum ClientFocusEnum {
	VERY_SMALL_BUSINESSES = 'Very Small Businesses',
	SMALL_BUSINESSES = 'Small Businesses',
	MEDIUM_BUSINESSES = 'Medium Businesses',
	LARGE_BUSINESSES = 'Large Businesses'
}

export const DEFAULT_PROFIT_BASED_BONUS = 75;
export const DEFAULT_REVENUE_BASED_BONUS = 10;
