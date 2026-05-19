import type { CollectionConfig } from 'payload/types';
import { publishFields } from './_fields';

// Powers /webinars (Template I, Zoom variant). Registration via /api/webinars/register.
export const Webinars: CollectionConfig = {
  slug: 'webinars',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'startsAt', 'status'] },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    ...publishFields,
    { name: 'description', type: 'textarea', localized: true },
    { name: 'speaker', type: 'text' },
    { name: 'startsAt', type: 'date', required: true },
    { name: 'zoomMeetingId', type: 'text' },
    { name: 'replayUrl', type: 'text', admin: { description: 'Set after the webinar ends' } },
  ],
};
