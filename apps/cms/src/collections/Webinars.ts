import type { CollectionConfig } from 'payload/types';
import { seoFields, slugField } from './_fields';

// Powers /webinars — upcoming sessions + replay archive.
export const Webinars: CollectionConfig = {
  slug: 'webinars',
  admin: {
    group: 'Education',
    useAsTitle: 'title',
    defaultColumns: ['title', 'speaker', 'status', 'scheduledAt'],
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200, localized: true },
    slugField('title'),
    { name: 'speaker', type: 'text', required: true, maxLength: 100 },
    { name: 'speakerBio', type: 'textarea', maxLength: 300, localized: true },
    {
      name: 'scheduledAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'UTC date + time. Drives upcoming/past sort and live-now detection.',
      },
    },
    { name: 'timezone', type: 'text', admin: { description: 'Display hint, e.g. UTC+3.' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      options: ['upcoming', 'live', 'completed', 'cancelled'],
    },
    {
      name: 'zoomRegistrationLink',
      type: 'text',
      admin: {
        description: 'Public Zoom URL. Shown when status is upcoming or live.',
        condition: (data) => data?.status === 'upcoming' || data?.status === 'live',
      },
    },
    {
      name: 'zoomWebinarId',
      type: 'text',
      admin: { description: 'Numeric Zoom ID — enables POST /api/webinars/register.' },
    },
    {
      name: 'replayUrl',
      type: 'text',
      admin: {
        description: 'Replay video URL. Shown when status is completed.',
        condition: (data) => data?.status === 'completed',
      },
    },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    ...seoFields,
  ],
};
