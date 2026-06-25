import type { CollectionConfig } from 'payload/types';
import {
  allowAnyCategory,
  gatedUploadRead,
  publicReadWhere,
  seoFields,
  slugField,
} from './_fields';
import { deriveAlphabeticalIndex } from '../hooks';
import CategorySelect from '../components/CategorySelect';

const MEDIA_CATEGORIES = [
  { label: 'Macro', value: 'macro' },
  { label: 'Strategy', value: 'strategy' },
  { label: 'Education', value: 'education' },
  { label: 'Interviews', value: 'interviews' },
  { label: 'Live', value: 'live' },
];
const GLOSSARY_CATEGORIES = [
  { label: 'Pricing', value: 'PRICING' },
  { label: 'Forex', value: 'FOREX' },
  { label: 'Strategy', value: 'STRATEGY' },
  { label: 'Risk', value: 'RISK' },
  { label: 'Order / Execution', value: 'ORDER/EXEC' },
  { label: 'Analysis', value: 'ANALYSIS' },
  { label: 'Chart / Pattern', value: 'CHART/PATTERN' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'General', value: 'GENERAL' },
];

// Powers /videos, /audio, /ebooks, /glossary, /guides.
export const EducationContent: CollectionConfig = {
  slug: 'education-content',
  admin: {
    group: 'Education',
    useAsTitle: 'title',
    defaultColumns: ['title', 'contentType', 'status'],
  },
  access: { read: publicReadWhere({ status: { equals: 'published' } }) },
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
      // Withhold the file URL from anonymous REST reads when the item is gated,
      // so the email gate (POST /api/education/gate) cannot be bypassed (NE CR-2).
      access: { read: gatedUploadRead },
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
        condition: (data) => ['guide', 'video', 'audio'].includes(data?.contentType),
      },
    },
    {
      name: 'mediaCategory',
      type: 'select',
      options: MEDIA_CATEGORIES,
      validate: allowAnyCategory(false),
      admin: {
        description: 'Category filter tab shown on the Media Listing page.',
        condition: (data) => data?.contentType === 'video' || data?.contentType === 'audio',
        components: { Field: CategorySelect(MEDIA_CATEGORIES) },
      },
    },
    {
      name: 'glossaryCategory',
      type: 'select',
      options: GLOSSARY_CATEGORIES,
      validate: allowAnyCategory(false),
      admin: {
        description: 'Category chip shown on the Glossary page.',
        condition: (data) => data?.contentType === 'glossary',
        components: { Field: CategorySelect(GLOSSARY_CATEGORIES) },
      },
    },
    ...seoFields,
  ],
};
