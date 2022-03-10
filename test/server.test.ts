import { FastifyInstance } from 'fastify';

import { USD_MULTIPLIER } from '../src/lib/ledger';
import { buildTestApp } from './helper';


const TEST_CURRENT_DAY_TOKEN_CREDIT = 2.34;
const TEST_CURRENT_DAY_USD_DEBIT = TEST_CURRENT_DAY_TOKEN_CREDIT * USD_MULTIPLIER;
const TEST_TOTAL_USD_CREDIT = 1234.5678;
const TEST_USER_ID = 12;
const TEST_ACCOUNT = {
	current_day_token_credit: TEST_CURRENT_DAY_TOKEN_CREDIT,
	current_day_usd_debit: TEST_CURRENT_DAY_USD_DEBIT,
	total_usd_credit: TEST_TOTAL_USD_CREDIT,
};
const TEST_USER = {
	id: TEST_USER_ID,
	account: TEST_ACCOUNT,
};

/*
 * adding some mocks for the database to get a quick POC working
 * ideally this should be replaced with something like an in-memory database for fast integration tests
 */

const dbMock = {
	User: {
		findOne: jest.fn().mockReturnValue(TEST_USER),
	},
	Account: {
		findOneOrFail: jest.fn().mockReturnValue(TEST_ACCOUNT),
	},
};

const transactionalEntityManagerMock = {
	findOneOrFail: jest.fn((model, id) => {
		// @ts-ignore
		return dbMock[model.name].findOneOrFail(id);
	}),
	save: jest.fn(),
};

jest.mock('typeorm', () => {
	// Require the original module to not be mocked...
	const originalModule = jest.requireActual('typeorm');
	return {
		__esModule: true, // Use it when dealing with esModules
		...originalModule,
		createConnection: jest.fn().mockReturnValue({
			// @ts-ignore
			getRepository: model => dbMock[model.name],
			close: jest.fn(),
		}),
		getConnection: jest.fn().mockReturnValue({
			transaction: jest.fn(async cb => cb(transactionalEntityManagerMock)),
		}),
		getConnectionOptions: jest.fn().mockReturnValue({}),
	};
});

describe('Dreamland API tests', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		app = await buildTestApp();
	});

	test('GET /tokens returns history of tokens for a user for current day', (done) => {
		app.inject({
			method: 'GET',
			url: '/tokens',
			query: { user_id: TEST_USER_ID.toString() },
		}, (err, res) => {
			expect(res.statusCode).toBe(200);
			expect(dbMock.User.findOne).toHaveBeenCalledWith(TEST_USER_ID);
			expect(JSON.parse(res.payload)).toEqual({
				current_day_token_credit: TEST_CURRENT_DAY_TOKEN_CREDIT,
			});
			done(err);
		});
	});

	test('POST /tokens adds tokens for a user', (done) => {
		const TOKENS_TO_ADD = 1.23;
		const payload = {
			user_id: TEST_USER_ID,
			tokens: TOKENS_TO_ADD,
		};
		app.inject({
			method: 'POST',
			url: `/tokens`,
			payload,
		}, (err, res) => {
			expect(res.statusCode).toBe(200);
			expect(dbMock.User.findOne).toHaveBeenCalledWith(TEST_USER_ID);
			expect(transactionalEntityManagerMock.save).toHaveBeenCalledWith(TEST_ACCOUNT);
			expect(JSON.parse(res.payload)).toEqual({
				current_day_token_credit: TEST_CURRENT_DAY_TOKEN_CREDIT + TOKENS_TO_ADD,
			});
			TEST_ACCOUNT.current_day_token_credit = TEST_CURRENT_DAY_TOKEN_CREDIT;
			TEST_ACCOUNT.current_day_usd_debit = TEST_CURRENT_DAY_USD_DEBIT;
			done(err);
		});
	});

	test('POST /tokens should error if transaction balance is not correct', (done) => {
		const TOKENS_TO_ADD = 1.23;
		TEST_ACCOUNT.current_day_usd_debit = 0;
		const payload = {
			user_id: TEST_USER_ID,
			tokens: TOKENS_TO_ADD,
		};
		app.inject({
			method: 'POST',
			url: `/tokens`,
			payload,
		}, (err, res) => {
			expect(res.statusCode).toBe(500);
			expect(dbMock.User.findOne).toHaveBeenCalledWith(TEST_USER_ID);
			TEST_ACCOUNT.current_day_usd_debit = TEST_CURRENT_DAY_USD_DEBIT;
			done(err);
		});
	});

	test('GET /usd returns history of USD amounts for a user for current day', (done) => {
		app.inject({
			method: 'GET',
			url: '/usd',
			query: { user_id: TEST_USER_ID.toString() },
		}, (err, res) => {
			expect(res.statusCode).toBe(200);
			expect(dbMock.User.findOne).toHaveBeenCalledWith(TEST_USER_ID);
			expect(JSON.parse(res.payload)).toEqual({
				current_day_usd_debit: TEST_CURRENT_DAY_USD_DEBIT,
			});
			done(err);
		});
	});

	test('GET /stats returns stats for a user for current day', (done) => {
		app.inject({
			method: 'GET',
			url: '/stats',
			query: { user_id: TEST_USER_ID.toString() },
			// headers: {
			// 	Authorization: `Bearer ${token}`,
			// },
		}, (err, res) => {
			expect(res.statusCode).toBe(200);

			expect(JSON.parse(res.payload)).toEqual({
				current_day_usd_debit: TEST_CURRENT_DAY_USD_DEBIT,
				current_day_token_credit: TEST_CURRENT_DAY_TOKEN_CREDIT,
				total_usd_credit: TEST_TOTAL_USD_CREDIT,
			});
			done(err);
		});
	});

	afterAll(async () => {
		return app.close();
	});
});
