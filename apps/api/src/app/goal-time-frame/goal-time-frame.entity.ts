import { Entity, Column } from 'typeorm';
import { Base } from '../core/entities/base';
import { GoalTimeFrame as IGoalTimeFrame } from '@gauzy/models';
import { ApiProperty } from '@nestjs/swagger';

@Entity('goal_time_frame')
export class GoalTimeFrame extends Base implements IGoalTimeFrame {
	@ApiProperty({ type: String })
	@Column()
	name: string;

	@ApiProperty({ type: String })
	@Column()
	status: string;

	@ApiProperty({ type: Date })
	@Column()
	startDate: Date;

	@ApiProperty({ type: Date })
	@Column()
	endDate: Date;
}
