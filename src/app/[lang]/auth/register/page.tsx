import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { RegisterPage } from '@/components/pages/register-page';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface RegisterPageProps {
  params: Promise<{ lang: Language }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return {
    title: t('auth.register.title'),
    description: t('auth.register.description'),
  };
}

export default async function Register({ params }: RegisterPageProps) {
  const { lang } = await params;
  return <RegisterPage lang={lang} />;
}
