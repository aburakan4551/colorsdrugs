import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { ProfilePage } from '@/components/pages/profile-page';

interface ProfilePageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
    description: lang === 'ar' 
      ? 'إدارة الملف الشخصي وإعدادات الحساب'
      : 'Manage your profile and account settings',
  };
}

export default async function Profile({ params }: ProfilePageProps) {
  const { lang } = await params;
  return <ProfilePage lang={lang} />;
}
