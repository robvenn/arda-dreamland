import assert from 'assert';
import Decimal from 'decimal.js';
import { getConnection } from 'typeorm';

import { Account } from '../entities/account';
import { User } from '../entities/user';


// these values should probably be configurable through either env or stored in database
export const USD_MULTIPLIER = .15; // 15 cents per DREAM token
export const MAX_TOKENS_PER_DAY = 5;

const maxUsdValue = new Decimal(MAX_TOKENS_PER_DAY).times(USD_MULTIPLIER);

export async function addTokens(user: User, tokensToAdd: number): Promise<Account> {
	return getConnection().transaction(async transactionalEntityManager => {
		const account = user.account;

		let updatedCurrentTokensCredit = new Decimal(tokensToAdd).plus(account.current_day_token_credit);
		if (updatedCurrentTokensCredit.greaterThan(MAX_TOKENS_PER_DAY)) {
			updatedCurrentTokensCredit = new Decimal(MAX_TOKENS_PER_DAY);
		}

		const usdToAdd = new Decimal(tokensToAdd).times(USD_MULTIPLIER);
		let updatedCurrentUsdDebit = usdToAdd.plus(account.current_day_usd_debit);
		if (updatedCurrentUsdDebit.greaterThan(maxUsdValue)) {
			updatedCurrentUsdDebit = maxUsdValue;
		}

		const transactionIsValid = updatedCurrentUsdDebit.minus(updatedCurrentTokensCredit.times(USD_MULTIPLIER)).equals(0);
		assert(transactionIsValid, 'Token Credit must equal USD debit');

		account.current_day_token_credit = updatedCurrentTokensCredit.toNumber();
		account.current_day_usd_debit = updatedCurrentUsdDebit.toNumber();
		await transactionalEntityManager.save(account);

		return account;
	});
}
