import type { CollectionConfig } from 'payload/types';

// Central file store — images, PDFs, audio. Served via Cloudflare R2 CDN
// (@payloadcms/plugin-cloud-storage, wired in Phase 3 / NE-027).
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Administration', useAsTitle: 'filename' },
  access: { read: () => true },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf', 'audio/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      // Required for images (accessibility); optional for PDFs/audio.
      // Also enforces a 200×200 minimum dimension for image uploads.
      validate: (value, { data }) => {
        const meta = data as { mimeType?: string; width?: number; height?: number } | undefined;
        const mimeType = meta?.mimeType;
        if (mimeType?.startsWith('image/')) {
          if (!value) return 'Alt text is required for images.';
          const width = typeof meta?.width === 'number' ? meta.width : undefined;
          const height = typeof meta?.height === 'number' ? meta.height : undefined;
          if (width !== undefined && height !== undefined && (width < 200 || height < 200)) {
            return 'Image must be at least 200×200 pixels.';
          }
        }
        return true;
      },
    },
    {
      name: 'tags',
      type: 'array',
      maxRows: 10,
      labels: { singular: 'Tag', plural: 'Tags' },
      admin: { description: 'Filtering labels, e.g. hero, en, trading.' },
      fields: [{ name: 'value', type: 'text', required: true, maxLength: 30 }],
    },
  ],
};
