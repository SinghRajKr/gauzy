import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { TranslationBaseComponent } from '../../../@shared/language-base/translation-base.component';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '../../../@core/services/store.service';
import {
	CurrenciesEnum,
	Invoice,
	OrganizationClients,
	Organization,
	OrganizationProjects,
	Task,
	Employee,
	InvoiceTypeEnum,
	DiscountTaxTypeEnum,
	Product,
	Tag
} from '@gauzy/models';
import { OrganizationsService } from '../../../@core/services/organizations.service';
import { OrganizationSelectInput } from '@gauzy/models';
import { first, takeUntil } from 'rxjs/operators';
import { InvoicesService } from '../../../@core/services/invoices.service';
import { InvoiceItemService } from '../../../@core/services/invoice-item.service';
import { LocalDataSource } from 'ng2-smart-table';
import { InvoiceTasksSelectorComponent } from '../table-components/invoice-tasks-selector.component';
import { OrganizationClientsService } from '../../../@core/services/organization-clients.service ';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { OrganizationProjectsService } from '../../../@core/services/organization-projects.service';
import { InvoiceProjectsSelectorComponent } from '../table-components/invoice-project-selector.component';
import { InvoiceEmployeesSelectorComponent } from '../table-components/invoice-employees-selector.component';
import { ErrorHandlingService } from '../../../@core/services/error-handling.service';
import { EmployeesService } from '../../../@core/services';
import { ProductService } from '../../../@core/services/product.service';
import { InvoiceProductsSelectorComponent } from '../table-components/invoice-product-selector.component';
import { TasksStoreService } from '../../../@core/services/tasks-store.service';

@Component({
	selector: 'ga-invoice-add',
	templateUrl: './invoice-add.component.html',
	styleUrls: ['./invoice-add.component.scss']
})
export class InvoiceAddComponent extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	settingsSmartTable: object;
	loading = true;
	form: FormGroup;
	invoice?: Invoice;
	formInvoiceNumber: number;
	currencies = Object.values(CurrenciesEnum);
	invoiceTypes = Object.values(InvoiceTypeEnum);
	smartTableSource = new LocalDataSource();
	generatedTask: string;
	organization: Organization;
	selectedTasks: Task[];
	observableTasks: Observable<Task[]>;
	tasks: Task[];
	client: OrganizationClients;
	clients: OrganizationClients[];
	selectedProjects: OrganizationProjects[];
	projects: OrganizationProjects[];
	employees: Employee[];
	selectedEmployeeIds: string[];
	products: Product[];
	selectedProducts: Product[];
	invoiceType: string;
	selectedInvoiceType: string;
	shouldLoadTable: boolean;
	isEmployeeHourTable: boolean;
	isProjectHourTable: boolean;
	isTaskHourTable: boolean;
	isProductTable: boolean;
	disableSaveButton = true;
	organizationId: string;
	subtotal = 0;
	total = 0;
	tags: Tag[] = [];
	private _ngDestroy$ = new Subject<void>();
	get currency() {
		return this.form.get('currency');
	}

	@Input() isEstimate: boolean;

	constructor(
		private fb: FormBuilder,
		private readonly organizationClientsService: OrganizationClientsService,
		readonly translateService: TranslateService,
		private store: Store,
		private router: Router,
		private toastrService: NbToastrService,
		private invoicesService: InvoicesService,
		private organizationsService: OrganizationsService,
		private organizationProjectsService: OrganizationProjectsService,
		private invoiceItemService: InvoiceItemService,
		private tasksStore: TasksStoreService,
		private errorHandler: ErrorHandlingService,
		private employeeService: EmployeesService,
		private productService: ProductService
	) {
		super(translateService);
		this.observableTasks = this.tasksStore.tasks$;
	}

	ngOnInit() {
		if (!this.isEstimate) {
			this.isEstimate = false;
		}
		this._loadOrganizationData();
		this.initializeForm();
		this.form.get('currency').disable();
		this.loading = false;
	}

	initializeForm() {
		this.createInvoiceNumber();
		this.form = this.fb.group({
			invoiceDate: ['', Validators.required],
			invoiceNumber: [
				this.formInvoiceNumber,
				Validators.compose([Validators.required, Validators.min(1)])
			],
			dueDate: ['', Validators.required],
			currency: ['', Validators.required],
			discountValue: [
				0,
				Validators.compose([Validators.required, Validators.min(0)])
			],
			tax: [
				0,
				Validators.compose([Validators.required, Validators.min(0)])
			],
			terms: [''],
			client: ['', Validators.required],
			discountType: ['', Validators.required],
			taxType: ['', Validators.required],
			invoiceType: [''],
			project: [''],
			task: [''],
			product: [''],
			tags: ['']
		});
	}

	loadSmartTable() {
		this.settingsSmartTable = {
			add: {
				addButtonContent: '<i class="nb-plus"></i>',
				createButtonContent: '<i class="nb-checkmark"></i>',
				cancelButtonContent: '<i class="nb-close"></i>',
				confirmCreate: true
			},
			edit: {
				editButtonContent: '<i class="nb-edit"></i>',
				saveButtonContent: '<i class="nb-checkmark"></i>',
				cancelButtonContent: '<i class="nb-close"></i>',
				confirmSave: true
			},
			delete: {
				deleteButtonContent: '<i class="nb-trash"></i>',
				confirmDelete: true
			},
			columns: {}
		};
		let price = {};
		let quantity = {};
		switch (this.invoiceType) {
			case InvoiceTypeEnum.BY_EMPLOYEE_HOURS:
				this.settingsSmartTable['columns']['selectedItem'] = {
					title: this.getTranslation(
						'INVOICES_PAGE.INVOICE_ITEM.EMPLOYEE'
					),
					filter: false,
					width: '25%',
					editor: {
						type: 'custom',
						component: InvoiceEmployeesSelectorComponent
					},
					valuePrepareFunction: (cell) => {
						const employee = this.employees.find(
							(e) => e.id === cell
						);
						return `${employee.user.firstName} ${employee.user.lastName}`;
					}
				};
				break;
			case InvoiceTypeEnum.BY_PROJECT_HOURS:
				this.settingsSmartTable['columns']['selectedItem'] = {
					title: this.getTranslation(
						'INVOICES_PAGE.INVOICE_ITEM.PROJECT'
					),
					filter: false,
					editor: {
						type: 'custom',
						component: InvoiceProjectsSelectorComponent
					},
					valuePrepareFunction: (cell) => {
						const project = this.projects.find(
							(p) => p.id === cell
						);
						return `${project.name}`;
					}
				};
				break;
			case InvoiceTypeEnum.BY_TASK_HOURS:
				this.settingsSmartTable['columns']['selectedItem'] = {
					title: this.getTranslation(
						'INVOICES_PAGE.INVOICE_ITEM.TASK'
					),
					filter: false,
					editor: {
						type: 'custom',
						component: InvoiceTasksSelectorComponent
					},
					valuePrepareFunction: (cell) => {
						const task = this.tasks.find((t) => t.id === cell);
						return `${task.title}`;
					}
				};
				break;
			case InvoiceTypeEnum.BY_PRODUCTS:
				this.settingsSmartTable['columns']['selectedItem'] = {
					title: this.getTranslation(
						'INVOICES_PAGE.INVOICE_ITEM.PRODUCT'
					),
					filter: false,
					editor: {
						type: 'custom',
						component: InvoiceProductsSelectorComponent
					},
					valuePrepareFunction: (cell) => {
						const product = this.products.find(
							(p) => p.id === cell
						);
						return `${product.name}`;
					}
				};
				break;
			default:
				break;
		}

		if (
			this.invoiceType === InvoiceTypeEnum.BY_EMPLOYEE_HOURS ||
			this.invoiceType === InvoiceTypeEnum.BY_PROJECT_HOURS ||
			this.invoiceType === InvoiceTypeEnum.BY_TASK_HOURS
		) {
			price = {
				title: this.getTranslation(
					'INVOICES_PAGE.INVOICE_ITEM.HOURLY_RATE'
				),
				type: 'text',
				filter: false,
				valuePrepareFunction: (cell, row) => {
					return `${this.currency.value} ${cell}`;
				}
			};
			quantity = {
				title: this.getTranslation(
					'INVOICES_PAGE.INVOICE_ITEM.HOURS_WORKED'
				),
				type: 'text',
				filter: false
			};
		} else if (
			this.invoiceType === InvoiceTypeEnum.DETAILS_INVOICE_ITEMS ||
			this.invoiceType === InvoiceTypeEnum.BY_PRODUCTS
		) {
			price = {
				title: this.getTranslation('INVOICES_PAGE.INVOICE_ITEM.PRICE'),
				type: 'text',
				filter: false,
				valuePrepareFunction: (cell, row) => {
					return `${this.currency.value} ${cell}`;
				}
			};
			quantity = {
				title: this.getTranslation(
					'INVOICES_PAGE.INVOICE_ITEM.QUANTITY'
				),
				type: 'text',
				filter: false
			};
		}
		this.settingsSmartTable['columns']['description'] = {
			title: this.getTranslation(
				'INVOICES_PAGE.INVOICE_ITEM.DESCRIPTION'
			),
			type: 'text'
		};
		this.settingsSmartTable['columns']['price'] = price;
		this.settingsSmartTable['columns']['quantity'] = quantity;
		this.settingsSmartTable['columns']['totalValue'] = {
			title: this.getTranslation(
				'INVOICES_PAGE.INVOICE_ITEM.TOTAL_VALUE'
			),
			type: 'text',
			addable: false,
			editable: false,
			valuePrepareFunction: (cell, row) => {
				return `${this.currency.value} ${row.quantity * row.price}`;
			},
			filter: false
		};
	}

	async addInvoice() {
		const tableData = await this.smartTableSource.getAll();
		if (tableData.length) {
			const invoiceData = this.form.value;
			if (
				!invoiceData.invoiceDate ||
				!invoiceData.dueDate ||
				this.compareDate(invoiceData.invoiceDate, invoiceData.dueDate)
			) {
				this.toastrService.danger(
					this.getTranslation('INVOICES_PAGE.INVALID_DATES'),
					this.getTranslation('TOASTR.TITLE.WARNING')
				);
				return;
			}

			if (tableData[0].hasOwnProperty('selectedEmployee')) {
				for (const invoiceItem of tableData) {
					if (!invoiceItem.selectedEmployee) {
						this.toastrService.danger(
							this.getTranslation(
								'INVOICES_PAGE.INVOICE_ITEM.EMPLOYEE_VALUE'
							),
							this.getTranslation('TOASTR.TITLE.WARNING')
						);
						return;
					}
				}
			} else if (tableData[0].hasOwnProperty('project')) {
				for (const invoiceItem of tableData) {
					if (!invoiceItem.project) {
						this.toastrService.danger(
							this.getTranslation(
								'INVOICES_PAGE.INVOICE_ITEM.PROJECT_VALUE'
							),
							this.getTranslation('TOASTR.TITLE.WARNING')
						);
						return;
					}
				}
			} else if (tableData[0].hasOwnProperty('task')) {
				for (const invoiceItem of tableData) {
					if (!invoiceItem.task) {
						this.toastrService.danger(
							this.getTranslation(
								'INVOICES_PAGE.INVOICE_ITEM.TASK_VALUE'
							),
							this.getTranslation('TOASTR.TITLE.WARNING')
						);
						return;
					}
				}
			}

			const invoice = await this.invoicesService.getAll([], {
				invoiceNumber: invoiceData.invoiceNumber
			});

			if (invoice.items.length) {
				this.toastrService.danger(
					this.getTranslation(
						'INVOICES_PAGE.INVOICE_NUMBER_DUPLICATE'
					),
					this.getTranslation('TOASTR.TITLE.WARNING')
				);
				return;
			}

			const createdInvoice = await this.invoicesService.add({
				invoiceNumber: invoiceData.invoiceNumber,
				invoiceDate: invoiceData.invoiceDate,
				dueDate: invoiceData.dueDate,
				currency: this.currency.value,
				discountValue: invoiceData.discountValue,
				discountType: invoiceData.discountType,
				tax: invoiceData.tax,
				taxType: invoiceData.taxType,
				terms: invoiceData.terms,
				paid: false,
				totalValue: +this.total.toFixed(2),
				toClient: invoiceData.client,
				clientId: invoiceData.client.id,
				fromOrganization: this.organization,
				organizationId: this.organization.id,
				invoiceType: this.selectedInvoiceType,
				tags: this.tags,
				isEstimate: this.isEstimate,
				sentStatus: false
			});

			for (const invoiceItem of tableData) {
				const itemToAdd = {
					description: invoiceItem.description,
					price: invoiceItem.price,
					quantity: invoiceItem.quantity,
					totalValue: invoiceItem.totalValue,
					invoiceId: createdInvoice.id
				};
				switch (this.selectedInvoiceType) {
					case InvoiceTypeEnum.BY_EMPLOYEE_HOURS:
						itemToAdd['employeeId'] = invoiceItem.selectedItem;
						break;
					case InvoiceTypeEnum.BY_PROJECT_HOURS:
						itemToAdd['projectId'] = invoiceItem.selectedItem;
						break;
					case InvoiceTypeEnum.BY_TASK_HOURS:
						itemToAdd['taskId'] = invoiceItem.selectedItem;
						break;
					case InvoiceTypeEnum.BY_PRODUCTS:
						itemToAdd['productId'] = invoiceItem.selectedItem;
						break;
					default:
						break;
				}
				await this.invoiceItemService.add(itemToAdd);
			}

			if (this.isEstimate) {
				this.toastrService.primary(
					this.getTranslation('INVOICES_PAGE.INVOICES_ADD_ESTIMATE'),
					this.getTranslation('TOASTR.TITLE.SUCCESS')
				);
				this.router.navigate(['/pages/accounting/invoices/estimates']);
			} else {
				this.toastrService.primary(
					this.getTranslation('INVOICES_PAGE.INVOICES_ADD_INVOICE'),
					this.getTranslation('TOASTR.TITLE.SUCCESS')
				);
				this.router.navigate(['/pages/accounting/invoices']);
			}
		} else {
			this.toastrService.danger(
				this.getTranslation('INVOICES_PAGE.INVOICE_ITEM.NO_ITEMS'),
				this.getTranslation('TOASTR.TITLE.WARNING')
			);
		}
	}

	private async createInvoiceNumber() {
		const invoiceNumber = await this.invoicesService.getHighestInvoiceNumber();
		if (invoiceNumber['max']) {
			this.formInvoiceNumber = +invoiceNumber['max'] + 1;
		} else {
			this.formInvoiceNumber = 1;
		}
	}

	private async _loadOrganizationData() {
		this.store.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(async (organization) => {
				if (organization) {
					this.employeeService
						.getAll(['user'])
						.pipe(takeUntil(this._ngDestroy$))
						.subscribe((employees) => {
							this.employees = employees.items.filter((emp) => {
								return (
									emp.orgId === organization.id ||
									organization.id === ''
								);
							});
						});

					const projects = await this.organizationProjectsService.getAll(
						[],
						{ organizationId: organization.id }
					);
					this.projects = projects.items;
					this.organization = organization;
					const orgData = await this.organizationsService
						.getById(organization.id, [
							OrganizationSelectInput.currency
						])
						.pipe(first())
						.toPromise();

					if (orgData && this.currency && !this.currency.value) {
						this.currency.setValue(orgData.currency);
					}

					const res = await this.organizationClientsService.getAll(
						['projects'],
						{
							organizationId: organization.id
						}
					);

					if (res) {
						this.clients = res.items;
					}

					this.tasksStore.fetchTasks();
					this.observableTasks.subscribe((data) => {
						this.tasks = data;
					});

					const products = await this.productService.getAll([], {
						organizationId: organization.id
					});
					this.products = products.items;
				}
			});
	}

	onTypeChange($event) {
		this.invoiceType = $event;

		let isEmployeeHourTable = false;
		let isProjectHourTable = false;
		let isTaskHourTable = false;
		let isProductTable = false;

		switch ($event) {
			case InvoiceTypeEnum.BY_EMPLOYEE_HOURS:
				isEmployeeHourTable = true;
				break;
			case InvoiceTypeEnum.BY_PROJECT_HOURS:
				isProjectHourTable = true;
				break;
			case InvoiceTypeEnum.BY_TASK_HOURS:
				isTaskHourTable = true;
				break;
			case InvoiceTypeEnum.BY_PRODUCTS:
				isProductTable = true;
				break;
			default:
				break;
		}

		this.isEmployeeHourTable = isEmployeeHourTable;
		this.isProjectHourTable = isProjectHourTable;
		this.isTaskHourTable = isTaskHourTable;
		this.isProductTable = isProductTable;
	}

	async generateTable() {
		this.selectedInvoiceType = this.invoiceType;
		this.smartTableSource.refresh();
		const fakeData = [];
		let fakePrice = 10;
		let fakeQuantity = 5;
		if (this.invoiceType === InvoiceTypeEnum.BY_EMPLOYEE_HOURS) {
			if (this.selectedEmployeeIds.length) {
				for (const employeeId of this.selectedEmployeeIds) {
					const data = {
						description: 'Desc',
						price: fakePrice,
						quantity: fakeQuantity,
						selectedItem: employeeId,
						totalValue: fakePrice * fakeQuantity
					};
					fakeData.push(data);
					fakePrice++;
					fakeQuantity++;
				}
			}
		} else if (this.invoiceType === InvoiceTypeEnum.BY_PROJECT_HOURS) {
			if (this.selectedProjects.length) {
				for (const project of this.selectedProjects) {
					const data = {
						description: 'Desc',
						price: fakePrice,
						quantity: fakeQuantity,
						selectedItem: project.id,
						totalValue: fakePrice * fakeQuantity
					};
					fakeData.push(data);
					fakePrice++;
					fakeQuantity++;
				}
			}
		} else if (this.invoiceType === InvoiceTypeEnum.BY_TASK_HOURS) {
			if (this.selectedTasks.length) {
				for (const task of this.selectedTasks) {
					const data = {
						description: 'Desc',
						price: fakePrice,
						quantity: fakeQuantity,
						selectedItem: task.id,
						totalValue: fakePrice * fakeQuantity
					};
					fakeData.push(data);
					fakePrice++;
					fakeQuantity++;
				}
			}
		} else if (this.invoiceType === InvoiceTypeEnum.BY_PRODUCTS) {
			if (this.selectedProducts.length) {
				for (const product of this.selectedProducts) {
					const data = {
						description: 'Desc',
						price: fakePrice,
						quantity: fakeQuantity,
						selectedItem: product.id,
						totalValue: fakePrice * fakeQuantity
					};
					fakeData.push(data);
					fakePrice++;
					fakeQuantity++;
				}
			}
		}

		if (fakeData.length) {
			let subtotal = 0;
			for (const data of fakeData) {
				let itemTotal = 0;
				itemTotal += +data.price * +data.quantity;
				subtotal += itemTotal;
			}
			this.subtotal = subtotal;
		} else {
			this.subtotal = 0;
		}

		this.shouldLoadTable = true;
		this.disableSaveButton = false;
		this.loadSmartTable();
		this._applyTranslationOnSmartTable();
		this.smartTableSource.load(fakeData);
		this.calculateTotal();
	}

	selectTask($event) {
		this.selectedTasks = $event;
	}

	selectClient($event) {
		this.client = $event;
	}

	selectProject($event) {
		this.selectedProjects = $event;
	}

	selectProduct($event) {
		this.selectedProducts = $event;
	}

	searchClient(term: string, item: any) {
		if (item.name) {
			return item.name.toLowerCase().includes(term.toLowerCase());
		}
	}

	onMembersSelected(event) {
		this.selectedEmployeeIds = event;
	}

	calculateTotal() {
		const discountValue =
			this.form.value.discountValue && this.form.value.discountValue > 0
				? this.form.value.discountValue
				: 0;
		const tax =
			this.form.value.tax && this.form.value.tax > 0
				? this.form.value.tax
				: 0;

		let totalDiscount = 0;
		let totalTax = 0;

		switch (this.form.value.discountType) {
			case DiscountTaxTypeEnum.PERCENT:
				totalDiscount = this.subtotal * (discountValue / 100);
				break;
			case DiscountTaxTypeEnum.FLAT_VALUE:
				totalDiscount = discountValue;
				break;
			default:
				totalDiscount = 0;
				break;
		}
		switch (this.form.value.taxType) {
			case DiscountTaxTypeEnum.PERCENT:
				totalTax = this.subtotal * (tax / 100);
				break;
			case DiscountTaxTypeEnum.FLAT_VALUE:
				totalTax = tax;
				break;
			default:
				totalTax = 0;
				break;
		}

		this.total = this.subtotal - totalDiscount + totalTax;

		if (this.total < 0) {
			this.total = 0;
		}
	}

	async onCurrencyChange() {
		const tableData = await this.smartTableSource.getAll();
		this.smartTableSource.load(tableData);
	}

	onCreateConfirm(event) {
		if (
			!isNaN(event.newData.quantity) &&
			!isNaN(event.newData.price) &&
			event.newData.quantity &&
			event.newData.price &&
			event.newData.description &&
			event.newData.selectedItem
		) {
			const newData = event.newData;
			const itemTotal = +event.newData.quantity * +event.newData.price;
			newData.totalValue = itemTotal;
			this.subtotal += itemTotal;
			this.calculateTotal();
			event.confirm.resolve(newData);
		} else {
			this.toastrService.danger(
				this.getTranslation('INVOICES_PAGE.INVOICE_ITEM.INVALID_ITEM'),
				this.getTranslation('TOASTR.TITLE.WARNING')
			);
			event.confirm.reject();
		}
	}

	onEditConfirm(event) {
		if (
			!isNaN(event.newData.quantity) &&
			!isNaN(event.newData.price) &&
			event.newData.quantity &&
			event.newData.price &&
			event.newData.description &&
			event.newData.selectedItem
		) {
			const newData = event.newData;
			const oldValue = +event.data.quantity * +event.data.price;
			const newValue = +newData.quantity * +event.newData.price;
			newData.totalValue = newValue;
			if (newValue > oldValue) {
				this.subtotal += newValue - oldValue;
			} else if (oldValue > newValue) {
				this.subtotal -= oldValue - newValue;
			}
			this.calculateTotal();
			event.confirm.resolve(newData);
		} else {
			this.toastrService.danger(
				this.getTranslation('INVOICES_PAGE.INVOICE_ITEM.INVALID_ITEM'),
				this.getTranslation('TOASTR.TITLE.WARNING')
			);
			event.confirm.reject();
		}
	}

	onDeleteConfirm(event) {
		this.subtotal -= +event.data.quantity * +event.data.price;
		this.calculateTotal();
		event.confirm.resolve(event.data);
	}

	compareDate(date1: Date, date2: Date): boolean {
		const d1 = new Date(date1);
		const d2 = new Date(date2);

		const same = d1.getTime() === d2.getTime();

		if (same) {
			return false;
		}

		return d1 > d2;
	}

	addNewClient = (name: string): Promise<OrganizationClients> => {
		this.organizationId = this.store.selectedOrganization.id;
		try {
			this.toastrService.primary(
				this.getTranslation(
					'NOTES.ORGANIZATIONS.EDIT_ORGANIZATIONS_CLIENTS.ADD_CLIENT',
					{
						name: name
					}
				),
				this.getTranslation('TOASTR.TITLE.SUCCESS')
			);
			return this.organizationClientsService.create({
				name,
				organizationId: this.organizationId
			});
		} catch (error) {
			this.errorHandler.handleError(error);
		}
	};

	cancel() {
		if (this.isEstimate) {
			this.router.navigate(['/pages/accounting/invoices/estimates']);
		} else {
			this.router.navigate(['/pages/accounting/invoices']);
		}
	}

	_applyTranslationOnSmartTable() {
		this.translateService.onLangChange.subscribe(() => {
			this.loadSmartTable();
		});
	}
	selectedTagsEvent(currentTagSelection: Tag[]) {
		this.tags = currentTagSelection;
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
