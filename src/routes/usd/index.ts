import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import httpErrors from 'http-errors';

import { User } from '../../entities/user';
import { getUsdSchema } from './schemas';


type GetUsdReq = FastifyRequest<{
	Querystring: { user_id: string };
}>;

const usd: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
	fastify.get('/', { schema: getUsdSchema }, async function (request: GetUsdReq, reply) {
		const { user_id } = request.query;
		const user = await this.orm
			.getRepository(User)
			.findOne(user_id);
		if (!user) {
			throw new httpErrors.NotFound();
		}
		return { current_day_usd_debit: user.account.current_day_usd_debit };
	});
}

export default usd;
