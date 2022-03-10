module.exports = {
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json'
		}
	},
	moduleFileExtensions: ['ts', 'tsx', 'js'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	testMatch: ['**/test/**/*.test.ts'],
	testEnvironment: 'node'
}