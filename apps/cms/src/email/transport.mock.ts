// Browser-safe stub for the admin webpack bundle.
// The real transport (./transport.ts) imports nodemailer, which is server-only.
// payload.config.ts uses a webpack alias to swap this file in for the admin build.
export const emailTransport = {
  name: 'noop-transport',
  version: '1.0.0',
  send: async () => undefined,
};
