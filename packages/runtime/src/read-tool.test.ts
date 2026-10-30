import { describe, expect, it } from 'vitest';
import { createReadTool } from './agent.ts';
import type { Sandbox } from './types.ts';

describe('createReadTool', () => {
	it('reads text files as text content', async () => {
		const mockEnv = {
			async readFile(_path: string) {
				return 'hello world\nline 2';
			},
		} as unknown as Sandbox;

		const tool = createReadTool(mockEnv);
		const result = await tool.execute('call-1', { path: 'test.txt' });

		expect(result.content).toEqual([
			{
				type: 'text',
				text: 'hello world\nline 2',
			},
		]);
		expect(result.details).toEqual({
			path: 'test.txt',
			lines: 2,
		});
	});

	it('returns image files as image content with base64 data and mimeType', async () => {
		const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
		const mockEnv = {
			async readFileBuffer(_path: string) {
				return pngBytes;
			},
		} as unknown as Sandbox;

		const tool = createReadTool(mockEnv);
		const result = await tool.execute('call-2', { path: 'photo.png' });

		expect(result.content).toHaveLength(1);
		expect(result.content[0]).toEqual({
			type: 'image',
			data: 'iVBORw0KGgo=',
			mimeType: 'image/png',
		});
		expect(result.details).toEqual({
			path: 'photo.png',
			mimeType: 'image/png',
			size: 8,
		});
	});

	it('supports jpeg, gif, and webp image extensions', async () => {
		const bytes = new Uint8Array([1, 2, 3]);
		const mockEnv = {
			async readFileBuffer(_path: string) {
				return bytes;
			},
		} as unknown as Sandbox;

		const tool = createReadTool(mockEnv);

		const jpg = await tool.execute('call-3', { path: 'image.jpg' });
		expect(jpg.content[0]).toMatchObject({ type: 'image', mimeType: 'image/jpeg' });

		const gif = await tool.execute('call-4', { path: 'anim.gif' });
		expect(gif.content[0]).toMatchObject({ type: 'image', mimeType: 'image/gif' });

		const webp = await tool.execute('call-5', { path: 'icon.webp' });
		expect(webp.content[0]).toMatchObject({ type: 'image', mimeType: 'image/webp' });
	});
});
