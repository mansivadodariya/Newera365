import React, { useEffect, useRef, useState } from 'react';

/**
 * Renders a 2FA code input above the admin login form and injects its value into
 * the POST /api/users/login request body.
 *
 * Payload v2 does not expose a way to add fields to its built-in login form, so we
 * intercept window.fetch for the login request and merge in `otp`. The matching
 * beforeLogin hook (auth/totp.ts → enforceTotpOnLogin) reads `req.body.otp` and
 * rejects the login when the user has 2FA enabled and the code is missing/invalid.
 *
 * Browser-only React — imports no Node modules.
 */
export default function TwoFactorLoginField(): React.ReactElement {
  const otpRef = useRef('');
  const [value, setValue] = useState('');

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const patched: typeof window.fetch = async (input, init) => {
      try {
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        const method = (
          init?.method ??
          (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET') ??
          'GET'
        ).toUpperCase();

        if (url.endsWith('/api/users/login') && method === 'POST' && otpRef.current) {
          if (typeof init?.body === 'string') {
            const parsed = JSON.parse(init.body) as Record<string, unknown>;
            parsed.otp = otpRef.current;
            init = { ...init, body: JSON.stringify(parsed) };
          }
        }
      } catch {
        // If anything about body parsing fails, fall through to the original request
        // unchanged rather than blocking login.
      }
      return originalFetch(input, init);
    };

    window.fetch = patched;
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <div className="field-type text" style={{ marginBottom: '1rem' }}>
      <label className="field-label" htmlFor="totp-code">
        Two-factor code <span style={{ color: '#9ca3af' }}>(if enabled)</span>
      </label>
      <input
        id="totp-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        value={value}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
          setValue(digits);
          otpRef.current = digits;
        }}
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '1rem',
          letterSpacing: '0.2em',
        }}
      />
    </div>
  );
}
