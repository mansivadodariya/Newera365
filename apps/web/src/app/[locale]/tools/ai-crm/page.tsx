import { permanentRedirect } from 'next/navigation';

export default function AiCrmToolsRedirect({ params }: { params: { locale: string } }) {
  permanentRedirect(`/${params.locale}/ai-crm`);
}
