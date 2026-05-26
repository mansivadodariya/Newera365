const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001';

export interface CmsNews {
  id: number;
  headline: string;
  slug: string;
  source?: string | null;
  sourceUrl?: string | null;
  publishedDate: string;
  category: 'forex' | 'commodities' | 'indices' | 'crypto' | 'company' | 'regulation';
  status: 'draft' | 'published';
  locale: 'en' | 'ar';
}

export interface CmsInstrument {
  id: number;
  name: string;
  symbol: string;
  mt5Symbol?: string | null;
  assetClass: 'forex' | 'commodities' | 'indices' | 'stocks' | 'etfs' | 'crypto';
  spread?: number | null;
  leverage?: string | null;
  tradingHours?: string | null;
  minTradeSize?: number | null;
  sortOrder?: number | null;
  status: 'active' | 'inactive';
}

export interface CmsAccountType {
  id: number;
  name: string;
  minDeposit: number;
  spreadFrom: string;
  leverage: string;
  platforms: ('mt5' | 'web-trader' | 'mobile')[];
  commission?: string | null;
  features?: { value: string; id?: string | null }[] | null;
  isPopular?: boolean | null;
  sortOrder?: number | null;
  status: 'active' | 'inactive';
}

interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
}

async function fetchCollection<T>(
  slug: string,
  params: Record<string, string> = {},
): Promise<PaginatedResponse<T>> {
  const qs = new URLSearchParams(params).toString();
  const url = `${CMS_URL}/api/${slug}${qs ? `?${qs}` : ''}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch {
    return { docs: [], totalDocs: 0 };
  }
}

export async function getLatestNews(locale: string, limit = 4): Promise<CmsNews[]> {
  const data = await fetchCollection<CmsNews>('news', {
    'where[status][equals]': 'published',
    'where[locale][equals]': locale,
    sort: '-publishedDate',
    limit: String(limit),
  });
  return data.docs;
}

export async function getInstruments(assetClass?: string, limit = 50): Promise<CmsInstrument[]> {
  const params: Record<string, string> = {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
    limit: String(limit),
  };
  if (assetClass) params['where[assetClass][equals]'] = assetClass;
  const data = await fetchCollection<CmsInstrument>('products-instruments', params);
  return data.docs;
}

export async function getAccountTypes(): Promise<CmsAccountType[]> {
  const data = await fetchCollection<CmsAccountType>('account-types', {
    'where[status][equals]': 'active',
    sort: 'sortOrder',
  });
  return data.docs;
}
