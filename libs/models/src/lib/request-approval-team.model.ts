import { BaseEntityModel as IBaseEntityModel } from './base-entity.model';
import { RequestApproval, OrganizationTeam } from '..';

export interface RequestApprovalTeam extends IBaseEntityModel {
	requestApprovalId: string;
	organizationTeamId: string;
	status: number;
	requestApproval: RequestApproval;
	team: OrganizationTeam;
}
