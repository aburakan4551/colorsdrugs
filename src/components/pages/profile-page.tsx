'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { 
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  EnvelopeIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProfilePageProps {
  lang: Language;
}

export function ProfilePage({ lang }: ProfilePageProps) {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const router = useRouter();
  const t = getTranslationsSync(lang);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${lang}/auth/login`);
    }
  }, [user, loading, router, lang]);

  useEffect(() => {
    if (user?.full_name) {
      setEditedName(user.full_name);
    }
  }, [user]);

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile
    toast.success(lang === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(user?.full_name || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return t('profile.admin_role');
      case 'super_admin':
        return t('profile.super_admin_role');
      default:
        return t('profile.user_role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 mb-6">
              <UserCircleIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('profile.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('profile.subtitle')}
            </p>
          </div>

          {/* Welcome Message */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('profile.welcome')}, {user.full_name || user.email}!
              </h2>
              <p className="text-muted-foreground">
                {lang === 'ar' 
                  ? 'يمكنك إدارة معلوماتك الشخصية وإعدادات حسابك من هنا'
                  : 'You can manage your personal information and account settings here'
                }
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('profile.personal_info')}
                </h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('profile.edit')}
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('profile.full_name')}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      placeholder={t('profile.full_name')}
                    />
                  ) : (
                    <p className="text-foreground font-medium">
                      {user.full_name || lang === 'ar' ? 'غير محدد' : 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('profile.email')}
                  </label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-muted-foreground mr-2 rtl:ml-2 rtl:mr-0" />
                    <p className="text-foreground font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <XMarkIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('profile.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                  >
                    <CheckIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('profile.save_changes')}
                  </Button>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('profile.account_info')}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('profile.role')}
                  </label>
                  <p className="text-foreground font-medium">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {t('profile.member_since')}
                  </label>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2 rtl:ml-2 rtl:mr-0" />
                    <p className="text-foreground font-medium">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start">
                {t('profile.change_password')}
              </Button>
              <Button variant="outline" className="justify-start">
                {t('profile.language_preferences')}
              </Button>
              <Button variant="outline" className="justify-start">
                {t('profile.test_history')}
              </Button>
              <Button variant="outline" className="justify-start">
                {t('profile.notification_settings')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
