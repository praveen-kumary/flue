import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCAL_ENV_ALLOWLIST, resolveBaseEnv } from './local-env.ts';

describe('local sandbox environment allowlist', () => {
	it('includes Windows-essential environment variables in DEFAULT_LOCAL_ENV_ALLOWLIST', () => {
		expect(DEFAULT_LOCAL_ENV_ALLOWLIST).toContain('SystemRoot');
		expect(DEFAULT_LOCAL_ENV_ALLOWLIST).toContain('windir');
		expect(DEFAULT_LOCAL_ENV_ALLOWLIST).toContain('ComSpec');
		expect(DEFAULT_LOCAL_ENV_ALLOWLIST).toContain('PATHEXT');
		expect(DEFAULT_LOCAL_ENV_ALLOWLIST).toContain('SystemDrive');
	});

	it('resolves base environment with inherited allowlisted variables', () => {
		const base = resolveBaseEnv(undefined);

		if (process.platform === 'win32') {
			expect(base.SystemRoot).toBeDefined();
			expect(base.SystemRoot).toBe(process.env.SystemRoot);
		}

		if (process.env.PATH) {
			expect(base.PATH).toBe(process.env.PATH);
		}
	});

	it('allows user overrides and dropping default variables with undefined', () => {
		const base = resolveBaseEnv({
			CUSTOM_VAR: 'custom-value',
			PATH: undefined,
			SystemRoot: undefined,
		});

		expect(base.CUSTOM_VAR).toBe('custom-value');
		expect(base.PATH).toBeUndefined();
		expect(base.SystemRoot).toBeUndefined();
	});

	it('throws TypeError if env option is invalid shape', () => {
		// @ts-expect-error testing invalid runtime input
		expect(() => resolveBaseEnv(true)).toThrow(TypeError);
		// @ts-expect-error testing invalid runtime input
		expect(() => resolveBaseEnv(['PATH'])).toThrow(TypeError);
	});
});
