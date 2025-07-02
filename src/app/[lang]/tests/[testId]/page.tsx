import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Language } from '@/types';
import { TestPage } from '@/components/pages/test-page';
import { DataService } from '@/lib/data-service';
import { getTranslations } from '@/lib/translations';

// Generate static params for all test combinations
export async function generateStaticParams() {
  // Use predefined test IDs for static generation to avoid Firebase calls during build
  const testIds = [
    'marquis', 'mecke', 'mandelin', 'liebermann', 'simon', 'froehde',
    'ehrlich', 'hofmann', 'chen', 'scott', 'zimmermann', 'robadope',
    'folin', 'gallic', 'vanillin', 'duquenois', 'cobalt', 'dille-koppanyi'
  ];
  const languages: Language[] = ['ar', 'en'];

  const params = [];
  for (const lang of languages) {
    for (const testId of testIds) {
      params.push({
        lang,
        testId,
      });
    }
  }

  return params;
}

interface TestPageProps {
  params: Promise<{
    lang: Language;
    testId: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language; testId: string }>;
}): Promise<Metadata> {
  const { lang, testId } = await params;
  const test = await DataService.getChemicalTestById(testId);

  if (!test) {
    return {
      title: 'Test Not Found',
    };
  }

  const testName = lang === 'ar' ? test.method_name_ar : test.method_name;
  const testDescription = lang === 'ar' ? test.description_ar : test.description;

  return {
    title: testName,
    description: testDescription,
  };
}

export default async function Test({ params }: TestPageProps) {
  const { lang, testId } = await params;
  const test = await DataService.getChemicalTestById(testId);

  if (!test) {
    notFound();
  }

  return <TestPage lang={lang} testId={testId} />;
}
