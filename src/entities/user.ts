import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsEmail } from 'class-validator';

import { Account } from './account';


@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	@IsEmail()
	email: string;

	@OneToOne(() => Account, {
		eager: true
	})
	@JoinColumn()
	account: Account;

}