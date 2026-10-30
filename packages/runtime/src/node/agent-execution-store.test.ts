import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { createNodeTransactionSync } from './agent-execution-store.ts';

describe('createNodeTransactionSync', () => {
	it('commits successful transactions', () => {
		const db = new DatabaseSync(':memory:');
		db.exec('CREATE TABLE items (id INTEGER PRIMARY KEY, value TEXT)');
		const runTransaction = createNodeTransactionSync(db);

		const result = runTransaction(() => {
			db.exec("INSERT INTO items (id, value) VALUES (1, 'hello')");
			return 42;
		});

		expect(result).toBe(42);
		const rows = db.prepare('SELECT * FROM items').all() as Array<{ id: number; value: string }>;
		expect(rows).toEqual([{ id: 1, value: 'hello' }]);
	});

	it('rolls back on standard user exception and preserves the original error', () => {
		const db = new DatabaseSync(':memory:');
		db.exec('CREATE TABLE items (id INTEGER PRIMARY KEY, value TEXT)');
		const runTransaction = createNodeTransactionSync(db);

		expect(() => {
			runTransaction(() => {
				db.exec("INSERT INTO items (id, value) VALUES (1, 'temp')");
				throw new Error('user error');
			});
		}).toThrow('user error');

		const rows = db.prepare('SELECT * FROM items').all();
		expect(rows).toEqual([]);
	});

	it('preserves the original error when SQLite automatically rolls back', () => {
		const db = new DatabaseSync(':memory:');
		db.exec('CREATE TABLE unique_items (x INTEGER UNIQUE ON CONFLICT ROLLBACK)');
		db.exec('INSERT INTO unique_items VALUES (1)');
		const runTransaction = createNodeTransactionSync(db);

		expect(() => {
			runTransaction(() => {
				db.exec('INSERT INTO unique_items VALUES (1)');
			});
		}).toThrow(/UNIQUE constraint failed: unique_items\.x/);
	});
});
