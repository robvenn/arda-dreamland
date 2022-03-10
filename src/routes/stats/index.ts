import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import httpErrors from 'http-errors';

import { User } from '../../entities/user';
import { getStatsSchema } from './schemas';


type GetStatsReq = FastifyRequest<{
	Querystring: { user_id: string };
}>;

const stats: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
	fastify.get('/', { schema: getStatsSchema }, async function (request: GetStatsReq, reply) {
		const { user_id } = request.query;
		const user = await this.orm
			.getRepository(User)
			.findOne(user_id);
		if (!user) {
			throw new httpErrors.NotFound();
		}
		const { account } = user;
		return {
			current_day_usd_debit: account.current_day_usd_debit,
			current_day_token_credit: account.current_day_token_credit,
			total_usd_credit: account.total_usd_credit,
		};
	});
}

export default stats;
