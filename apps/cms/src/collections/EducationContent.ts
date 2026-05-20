import type { CollectionConfig } from 'payload/types';
import { localizationFields, seoFields, slugField } from './_fields';
import { deriveAlphabeticalIndex, ensureTranslationKey, uniqueSlugPerLocale } from '../hooks';

// Powers /videos, /audio, /ebooks, /glossary, /guides. Webinar content is
// managed in the dedicated Webinars collection.
export const EducationContent: CollectionConfig = {
  slug: 'education-content',
  admin: {
    group: 'Education',
    useAsTitle: 'title',
    defaultColumns: ['title', 'contentType', 'status', 'locale'],
  },
  access: { read: () => true },
  hooks: {
    beforeValidate: [uniqueSlugPerLocale('education-content')],
    beforeChange: [ensureTranslationKey, deriveAlphabeticalIndex],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    slugField('title'),
    {
      name: 'contentType',
      type: 'select',
      required: true,
      options: ['video', 'audio', 'ebook', 'guide', 'glossary'],
      admin: { description: 'Controls which fields below are shown.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
    },
    {
      name: 'isGated',
      type: 'checkbox',
      admin: { description: 'Require an email submission before serving the content.' },
    },
    {
      name: 'videoEmbed',
      type: 'textarea',
      admin: {
        description: 'YouTube / Vimeo URL.',
        condition: (data) => data?.contentType === 'video',
      },
    },
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'MP3 / WAV (max 200 MB).',
        condition: (data) => data?.contentType === 'audio',
      },
    },
    {
      name: 'pdfFile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'PDF (max 50 MB).',
        condition: (data) => data?.contentType === 'ebook',
      },
    },
    {
      name: 'glossaryTerm',
      type: 'text',
      maxLength: 100,
      index: true,
      admin: {
        description: 'The term being defined.',
        condition: (data) => data?.contentType === 'glossary',
      },
    },
    {
      name: 'alphabeticalIndex',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-derived from the glossary term for A-Z grouping.',
        condition: (data) => data?.contentType === 'glossary',
      },
    },
    {
      name: 'body',
      type: 'richText',
      admin: { description: 'Required for guide and glossary content types.' },
      validate: (value, { data }) => {
        const contentType = (data as { contentType?: string } | undefined)?.contentType;
        const needsBody = contentType === 'guide' || contentType === 'glossary';
        if (needsBody && !value) return 'Body is required for guide and glossary content.';
        return true;
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Hub listing card image.' },
    },
    ...seoFields,
    ...localizationFields,
  ],
};
