import { setRequestLocale } from 'next-intl/server';
import { LiveChatPage } from '@newera365/ui';

export default function LiveChatRoute({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <LiveChatPage />;
}
