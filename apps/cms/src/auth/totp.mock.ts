// Browser-safe stub for the admin webpack bundle.
// The real module (./totp.ts) imports otplib + qrcode (Node crypto), which must
// not be bundled for the browser. payload.config.ts aliases this file in for the
// admin build. These handlers are never invoked in the browser — they exist only
// so the Users collection config (endpoints + beforeLogin) resolves at bundle time.
const noop = async (): Promise<void> => undefined;

export const totpSetupHandler = noop;
export const totpVerifyHandler = noop;
export const totpDisableHandler = noop;
export const enforceTotpOnLogin = noop;
