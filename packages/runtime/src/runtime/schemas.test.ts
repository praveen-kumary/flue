import { describe, expect, it } from 'vitest';
import { parseDeliveredMessage } from './schemas.ts';

describe('DeliveredMessageSchema', () => {
	it('preserves host metadata on user delivered messages', () => {
		const raw = {
			kind: 'user',
			body: 'Hello',
			metadata: {
				transport: 'slack',
				channelId: 'C12345',
			},
		};

		const parsed = parseDeliveredMessage(raw);
		expect(parsed).toEqual({
			kind: 'user',
			body: 'Hello',
			metadata: {
				transport: 'slack',
				channelId: 'C12345',
			},
		});
	});

	it('accepts user delivered messages without metadata', () => {
		const raw = {
			kind: 'user',
			body: 'Plain text',
		};

		const parsed = parseDeliveredMessage(raw);
		expect(parsed).toEqual({
			kind: 'user',
			body: 'Plain text',
		});
	});

	it('still strips unknown unexpected fields', () => {
		const raw = {
			kind: 'user',
			body: 'Hello',
			unknownField: 'dropped',
		};

		const parsed = parseDeliveredMessage(raw);
		expect(parsed).toEqual({
			kind: 'user',
			body: 'Hello',
		});
		expect((parsed as Record<string, unknown>).unknownField).toBeUndefined();
	});
});
