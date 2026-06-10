import type { CollectionConfig } from 'payload/types';
import { seoFields, slugField } from './_fields';
import { deriveAlphabeticalIndex } from '../hooks';

// Powers /videos, /audio, /ebooks, /glossary, /guides.
export const EducationContent: CollectionConfig = {
  slug: 'education-content',
  admin: {
    group: 'Education',
    useAsTitle: 'title',
    defaultColumns: ['title', 'contentType', 'status'],
  },
  access: { read: () => true },
  hooks: {
    beforeChange: [deriveAlphabeticalIndex],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200, localized: true },
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
      localized: true,
      admin: {
        description: 'The term being defined.',
        condition: (data) => data?.contentType === 'glossary',
      },
    },
    {
      name: 'alphabeticalIndex',
      type: 'text',
      index: true,
      localized: true,
      admin: {
        readOnly: true,
        description: 'Auto-derived from the glossary term for A-Z grouping.',
        condition: (data) => data?.contentType === 'glossary',
      },
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
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
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Pin this item as the featured card at the top of its listing page.',
        condition: (data) => data?.contentType === 'guide',
      },
    },
    {
      name: 'mediaCategory',
      type: 'select',
      options: [
        { label: 'Macro', value: 'macro' },
        { label: 'Strategy', value: 'strategy' },
        { label: 'Education', value: 'education' },
        { label: 'Interviews', value: 'interviews' },
        { label: 'Live', value: 'live' },
      ],
      admin: {
        description: 'Category filter tab shown on the Media Listing page.',
        condition: (data) => data?.contentType === 'video' || data?.contentType === 'audio',
      },
    },
    {
      name: 'glossaryCategory',
      type: 'select',
      options: [
        { label: 'Pricing', value: 'PRICING' },
        { label: 'Forex', value: 'FOREX' },
        { label: 'Strategy', value: 'STRATEGY' },
        { label: 'Risk', value: 'RISK' },
        { label: 'Order / Execution', value: 'ORDER/EXEC' },
        { label: 'Analysis', value: 'ANALYSIS' },
        { label: 'Chart / Pattern', value: 'CHART/PATTERN' },
        { label: 'Technical', value: 'TECHNICAL' },
        { label: 'General', value: 'GENERAL' },
      ],
      admin: {
        description: 'Category chip shown on the Glossary page.',
        condition: (data) => data?.contentType === 'glossary',
      },
    },
    ...seoFields,
  ],
};
