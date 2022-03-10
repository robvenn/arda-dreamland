import fp from 'fastify-plugin';
import typeorm, { FastifyTypeormOptions } from 'fastify-typeorm-plugin';

import { Account } from '../entities/account';
import { User } from '../entities/user';


export default fp<FastifyTypeormOptions>(async (fastify, opts) => {
	fastify.register(typeorm, {
		type: 'postgres',
		database: 'arda_dreamland',
		entities: [User, Account],
		username: 'postgres',
		password: 'postgres',
		synchronize: true,
	});
});
