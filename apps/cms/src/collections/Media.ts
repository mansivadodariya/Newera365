import type { CollectionConfig } from 'payload/types';

// Files are stored on Cloudflare R2 via @payloadcms/plugin-cloud-storage
// (configured in payload.config.ts). `staticDir` is the local dev fallback.
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf', 'audio/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
    ],
  },
  access: { read: () => true },
  fields: [{ name: 'alt', type: 'text', localized: true }],
};
