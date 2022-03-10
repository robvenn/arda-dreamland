import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Min, Max } from 'class-validator';


@Entity()
export class Account {

	@PrimaryGeneratedColumn()
	id: number;

	@Column('float')
	@Min(0)
	@Max(5)
	current_day_token_credit: number;

	@Column('float')
	@Min(0)
	current_day_usd_debit: number;

	@Column('float')
	total_usd_credit: number;

}