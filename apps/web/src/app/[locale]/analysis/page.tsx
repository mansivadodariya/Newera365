import { redirect } from 'next/navigation';

interface AnalysisPageRouteProps {
  params: { locale: string };
}

export default function Page({ params: { locale } }: AnalysisPageRouteProps) {
  redirect(`/${locale}/research/analyst-chart`);
}
