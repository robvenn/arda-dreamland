import { AssertionError } from 'assert';
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import httpErrors from 'http-errors';

import { getTokensSchema, postTokensSchema } from './schemas';
import { User } from '../../entities/user';
import { addTokens } from '../../lib/ledger';


type PostTokensReq = FastifyRequest<{
  Body: { user_id: string, tokens: number };
}>;

type GetTokensReq = FastifyRequest<{
  Querystring: { user_id: string };
}>;

const tokens: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', { schema: getTokensSchema }, async function (request: GetTokensReq, reply) {
    const { user_id } = request.query;
    const user = await this.orm
      .getRepository(User)
      .findOne(user_id);
    if (!user) {
      throw new httpErrors.NotFound();
    }
    return { current_day_token_credit: user.account.current_day_token_credit };
  });
  fastify.post('/', { schema: postTokensSchema }, async function (request: PostTokensReq, reply) {
    const { user_id, tokens: tokensToAdd } = request.body;
    const user = await this.orm
      .getRepository(User)
      .findOne(user_id);
    if (!user) {
      throw new httpErrors.NotFound();
    }
    try {
      const account = await addTokens(user, tokensToAdd);
      return { current_day_token_credit: account.current_day_token_credit };
    } catch (err) {
      if (err instanceof AssertionError) {
        throw new httpErrors.InternalServerError('transaction failed, incorrect balance');
      }
      throw new httpErrors.InternalServerError();
    }
  });
};

export default tokens;
