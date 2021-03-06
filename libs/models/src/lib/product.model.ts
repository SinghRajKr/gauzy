import { BaseEntityModel as IBaseEntityModel } from './base-entity.model';
import {
	Translation as ITranslation,
	Translatable as ITranslatable
} from './translation.model';
import { Organization } from './organization.model';
import { Tag } from './tag-entity.model';

export interface Product extends IBaseEntityModel {
	name: string;
	description: string;
	enabled: boolean;
	code: string;
	imageUrl: string;
	variants?: ProductVariant[];
	options?: ProductOption[];
	productTypeId: string;
	productCategoryId: string;
	type?: ProductTypeTranslatable;
	category?: ProductCategoryTranslatable;
	tags?: Tag[];
}

export interface IProductCreateInput {
	name: string;
	description: string;
	enabled: boolean;
	code: string;
	imageUrl: string;
	type?: ProductTypeTranslatable;
	category?: ProductCategoryTranslatable;
	tags?: Tag[];
	optionCreateInputs?: ProductOption[];
	optionDeleteInputs?: ProductOption[];
}

export interface ProductFindInput {
	organizationId?: string;
	id?: string;
}

export interface ProductTypeTranslatable
	extends ITranslatable<ProductTypeTranslation> {
	icon: string;
	organizationId?: string;
	organization?: Organization;
	products?: Product[];
}

export interface ProductTypeTranslation
	extends ITranslation<ProductTypeTranslatable> {
	name: string;
	description: string;
}

export interface ProductTypeTranslated extends IBaseEntityModel {
	icon: string;
	name: string;
	description: string;
}

export interface ProductCategoryTranslatable
	extends ITranslatable<ProductCategoryTranslation> {
	imageUrl: string;
	organizationId?: string;
	organization?: Organization;
	products?: Product[];
}

export interface ProductCategoryTranslation
	extends ITranslation<ProductCategoryTranslatable> {
	name: string;
	description: string;
}

export interface ProductCategoryTranslated extends IBaseEntityModel {
	imageUrl: string;
	name: string;
	description: string;
}

export interface ProductVariant extends IBaseEntityModel {
	price: ProductVariantPrice;
	taxes: number;
	notes: string;
	enabled: boolean;
	productId: string;
	quantity: number;
	billingInvoicingPolicy: string;
	internalReference: string;
	options: ProductOption[];
	settings: ProductVariantSettings;
	product?: Product;
}

export interface IVariantCreateInput {
	product: Product;
	optionCombinations: IVariantOptionCombination[];
}

export interface IVariantOptionCombination {
	options: string[];
}

export interface ProductVariantPrice extends IBaseEntityModel {
	unitCost: number;
	unitCostCurrency: string;
	retailPrice: number;
	retailPriceCurrency: string;
	productVariant: ProductVariant;
}

export interface ProductVariantSettings extends IBaseEntityModel {
	isSubscription: boolean;
	isPurchaseAutomatically: boolean;
	canBeSold: boolean;
	canBePurchased: boolean;
	canBeCharged: boolean;
	canBeRented: boolean;
	isEquipment: boolean;
	trackInventory: boolean;
	productVariant: ProductVariant;
}

export interface ProductOption extends IBaseEntityModel {
	name: string;
	code: string;
	product?: Product;
}

export enum BillingInvoicingPolicyEnum {
	QUANTITY_ORDERED = 'Quantity ordered',
	QUANTITY_DELIVERED = 'Quantity Delivered'
}

export enum ProductTypesIconsEnum {
	BRIEFCASE = 'briefcase-outline',
	CAR = 'car-outline',
	COLOR_PALETTE = 'color-palette-outline',
	FLASH = 'flash-outline',
	HOME = 'home-outline',
	GIFT = 'gift-outline',
	HEART = 'heart-outline',
	RADIO_BTN_OFF = 'radio-button-off-outline',
	PIN = 'pin-outline',
	SETTINGS = 'settings-outline',
	STAR = 'star-outline',
	SHOPPING_BAG = 'shopping-bag-outline',
	SHARE = 'share-outline',
	ACTIVITY = 'activity-outline',
	ALERT = 'alert-triangle-outline',
	BULB = 'bulb-outline',
	CHECKMARK = 'checkmark-circle-outline',
	GLOBE = 'globe-2-outline',
	LAYERS = 'layers-outline',
	PHONE = 'phone-outline',
	SHOPPING_CART = 'shopping-cart-outline'
}
