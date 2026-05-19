import type { CollectionConfig } from 'payload/types';
import { publishFields, seoField } from './_fields';

// Powers /videos, /audio, /ebooks, /guides, /glossary (Templates H, I, Unique).
export const EducationContent: CollectionConfig = {
  slug: 'education-content',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'contentType', 'status'] },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    ...publishFields,
    {
      name: 'contentType',
      type: 'select',
      required: true,
      options: ['video', 'audio', 'ebook', 'guide', 'glossary-term'],
    },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'embedUrl', type: 'text', admin: { description: 'YouTube/Vimeo embed for video/audio' } },
    { name: 'asset', type: 'upload', relationTo: 'media', admin: { description: 'PDF for ebooks' } },
    { name: 'gated', type: 'checkbox', defaultValue: false },
    { name: 'body', type: 'richText', localized: true },
    seoField,
  ],
};
