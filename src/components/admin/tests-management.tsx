'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import {
  chemicalTestsService,
  colorTestsService,
  ChemicalTest,
  ColorTest
} from '@/lib/firebase-data';
import toast from 'react-hot-toast';

interface TestsManagementProps {
  lang: Language;
}

interface TestFormData {
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  category: 'basic' | 'advanced' | 'specialized';
  safety_level: 'low' | 'medium' | 'high' | 'extreme';
  preparation_time: number;
  icon: string;
  color_primary: string;
  prepare?: string;
  prepare_ar?: string;
  test_type?: string;
  test_number?: string;
  reference?: string;
}

export function TestsManagement({ lang }: TestsManagementProps) {
  const [chemicalTests, setChemicalTests] = useState<ChemicalTest[]>([]);
  const [colorTests, setColorTests] = useState<ColorTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTest, setEditingTest] = useState<ChemicalTest | null>(null);
  const [formData, setFormData] = useState<TestFormData>({
    method_name: '',
    method_name_ar: '',
    description: '',
    description_ar: '',
    category: 'basic',
    safety_level: 'medium',
    preparation_time: 5,
    icon: 'BeakerIcon',
    color_primary: '#8B5CF6'
  });
  const [statistics, setStatistics] = useState({
    total_chemical_tests: 0,
    total_color_tests: 0,
    unique_substances: 0,
    unique_colors: 0
  });

  const t = getTranslationsSync(lang);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);

      // Load both chemical tests and color tests from Firebase
      const [chemicalTestsData, colorTestsData] = await Promise.all([
        chemicalTestsService.getAll(),
        colorTestsService.getAll()
      ]);

      setChemicalTests(chemicalTestsData);
      setColorTests(colorTestsData);

      // Calculate statistics
      const uniqueSubstances = new Set();
      const uniqueColors = new Set();

      colorTestsData.forEach(test => {
        if (test.possible_substance) uniqueSubstances.add(test.possible_substance);
        if (test.color_result) uniqueColors.add(test.color_result);
      });

      setStatistics({
        total_chemical_tests: chemicalTestsData.length,
        total_color_tests: colorTestsData.length,
        unique_substances: uniqueSubstances.size,
        unique_colors: uniqueColors.size
      });

      console.log('✅ Loaded tests from Firebase:', {
        chemical: chemicalTestsData.length,
        color: colorTestsData.length
      });

    } catch (error) {
      console.error('Error loading tests from Firebase:', error);
      toast.error('خطأ في تحميل الاختبارات | Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new test
  const handleAddTest = () => {
    setFormData({
      method_name: '',
      method_name_ar: '',
      description: '',
      description_ar: '',
      category: 'basic',
      safety_level: 'medium',
      preparation_time: 5,
      icon: 'BeakerIcon',
      color_primary: '#8B5CF6'
    });
    setEditingTest(null);
    setShowAddModal(true);
  };

  // Handle editing test
  const handleEditTest = (test: ChemicalTest) => {
    setFormData({
      method_name: test.method_name,
      method_name_ar: test.method_name_ar,
      description: test.description,
      description_ar: test.description_ar,
      category: test.category as any,
      safety_level: test.safety_level as any,
      preparation_time: test.preparation_time,
      icon: test.icon,
      color_primary: test.color_primary,
      prepare: test.prepare,
      prepare_ar: test.prepare_ar,
      test_type: test.test_type,
      test_number: test.test_number,
      reference: test.reference
    });
    setEditingTest(test);
    setShowEditModal(true);
  };

  // Handle saving test
  const handleSaveTest = async () => {
    try {
      if (!formData.method_name || !formData.method_name_ar) {
        toast.error('يرجى ملء جميع الحقول المطلوبة | Please fill all required fields');
        return;
      }

      const testData = {
        ...formData,
        created_at: editingTest?.created_at || new Date().toISOString()
      };

      if (editingTest) {
        // Update existing test
        await chemicalTestsService.update(editingTest.id, testData);
        toast.success('تم تحديث الاختبار بنجاح | Test updated successfully');
      } else {
        // Add new test
        await chemicalTestsService.add(testData as Omit<ChemicalTest, 'id'>);
        toast.success('تم إضافة الاختبار بنجاح | Test added successfully');
      }

      setShowAddModal(false);
      setShowEditModal(false);
      loadTests(); // Reload tests
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error('خطأ في حفظ الاختبار | Error saving test');
    }
  };

  // Handle deleting test
  const handleDeleteTest = async (test: ChemicalTest) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this test?')) {
      return;
    }

    try {
      await chemicalTestsService.delete(test.id);
      toast.success('تم حذف الاختبار بنجاح | Test deleted successfully');
      loadTests(); // Reload tests
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('خطأ في حذف الاختبار | Error deleting test');
    }
  };

  const handleViewDetails = (testId: string) => {
    setShowDetails(showDetails === testId ? null : testId);
  };

  const handleReloadData = async () => {
    await loadTests();
    toast.success(lang === 'ar' ? 'تم تحديث البيانات' : 'Data refreshed');
  };

  const filteredChemicalTests = chemicalTests.filter(test => {
    const matchesSearch = searchQuery === '' ||
      test.method_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.method_name_ar.includes(searchQuery) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description_ar.includes(searchQuery);

    const matchesTestType = selectedTestType === 'all' || test.category === selectedTestType;

    return matchesSearch && matchesTestType;
  });



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {lang === 'ar' ? 'إدارة الاختبارات الكيميائية' : 'Chemical Tests Management'}
          </h2>
          <p className="text-muted-foreground">
            {lang === 'ar'
              ? 'عرض وإدارة الاختبارات المستخرجة من النتائج اللونية'
              : 'View and manage tests extracted from color results'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            onClick={handleAddTest}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'إضافة اختبار جديد' : 'Add New Test'}</span>
          </Button>
          <Button
            onClick={handleReloadData}
            variant="outline"
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث في الاختبارات والمواد...' : 'Search tests and substances...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedTestType}
            onChange={(e) => setSelectedTestType(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{lang === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
            <option value="basic">{lang === 'ar' ? 'أساسي' : 'Basic'}</option>
            <option value="advanced">{lang === 'ar' ? 'متقدم' : 'Advanced'}</option>
            <option value="specialized">{lang === 'ar' ? 'متخصص' : 'Specialized'}</option>
          </select>
        </div>
        <div className="relative">
          <SwatchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <div className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-gray-50 text-gray-600">
            {lang === 'ar' ? `${filteredChemicalTests.length} اختبار` : `${filteredChemicalTests.length} tests`}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <BeakerIcon className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'الاختبارات الكيميائية' : 'Chemical Tests'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{statistics.total_chemical_tests}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <SwatchIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'اختبارات الألوان' : 'Color Tests'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{statistics.total_color_tests}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'المواد الفريدة' : 'Unique Substances'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{statistics.unique_substances}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <TagIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'الألوان الفريدة' : 'Unique Colors'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{statistics.unique_colors}</p>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'الاختبار' : 'Test'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'الفئة' : 'Category'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'مستوى الأمان' : 'Safety Level'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'وقت التحضير' : 'Prep Time'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredChemicalTests.map((test) => (
                <React.Fragment key={test.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div
                          className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: test.color_primary }}
                        >
                          <BeakerIcon className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {lang === 'ar' ? test.method_name_ar : test.method_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lang === 'ar' ? test.description_ar : test.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                        test.category === 'basic' ? 'bg-green-100 text-green-800 border-green-200' :
                        test.category === 'advanced' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        test.category === 'specialized' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {lang === 'ar' ?
                          (test.category === 'basic' ? 'أساسي' :
                           test.category === 'advanced' ? 'متقدم' :
                           test.category === 'specialized' ? 'متخصص' : 'غير محدد') :
                          test.category || 'Unspecified'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                        test.safety_level === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                        test.safety_level === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        test.safety_level === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        test.safety_level === 'extreme' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {lang === 'ar' ?
                          (test.safety_level === 'low' ? 'منخفض' :
                           test.safety_level === 'medium' ? 'متوسط' :
                           test.safety_level === 'high' ? 'عالي' :
                           test.safety_level === 'extreme' ? 'خطر شديد' : 'غير محدد') :
                          test.safety_level || 'Unspecified'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-foreground">{test.preparation_time}</span>
                        <span className="text-xs text-muted-foreground">
                          {lang === 'ar' ? 'دقيقة' : 'min'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(test.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTest(test)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTest(test)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Details Row */}
                  {showDetails === test.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">
                            {lang === 'ar' ? 'تفاصيل الاختبار:' : 'Test Details:'}
                          </h4>

                          {/* Test Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
                              <h5 className="text-sm font-semibold text-foreground mb-2">
                                {lang === 'ar' ? 'معلومات الاختبار:' : 'Test Information:'}
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div><strong>{lang === 'ar' ? 'الاسم:' : 'Name:'}</strong> {lang === 'ar' ? test.method_name_ar : test.method_name}</div>
                                <div><strong>{lang === 'ar' ? 'الوصف:' : 'Description:'}</strong> {lang === 'ar' ? test.description_ar : test.description}</div>
                                <div><strong>{lang === 'ar' ? 'الفئة:' : 'Category:'}</strong> {test.category}</div>
                                <div><strong>{lang === 'ar' ? 'مستوى الأمان:' : 'Safety Level:'}</strong> {test.safety_level}</div>
                                <div><strong>{lang === 'ar' ? 'وقت التحضير:' : 'Preparation Time:'}</strong> {test.preparation_time} {lang === 'ar' ? 'دقيقة' : 'minutes'}</div>
                              </div>
                            </div>

                            {/* Test Preparation */}
                            {test.prepare && (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
                                <h5 className="text-sm font-semibold text-foreground mb-2">
                                  {lang === 'ar' ? 'خطوات التحضير:' : 'Preparation Steps:'}
                                </h5>
                                <div className="text-sm text-muted-foreground whitespace-pre-line">
                                  {lang === 'ar' ? test.prepare_ar || test.prepare : test.prepare}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Reference */}
                          {test.reference && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                {lang === 'ar' ? 'المرجع العلمي:' : 'Scientific Reference:'}
                              </h5>
                              <div className="text-sm text-blue-800 dark:text-blue-200 font-mono">
                                {test.reference}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredChemicalTests.length === 0 && !loading && (
        <div className="text-center py-12">
          <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'لا توجد اختبارات' : 'No tests found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {lang === 'ar'
              ? 'لم يتم العثور على اختبارات تطابق معايير البحث'
              : 'No tests match the search criteria'
            }
          </p>
        </div>
      )}

      {/* Add/Edit Test Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">
                {editingTest ?
                  (lang === 'ar' ? 'تعديل الاختبار' : 'Edit Test') :
                  (lang === 'ar' ? 'إضافة اختبار جديد' : 'Add New Test')
                }
              </h3>

              <div className="space-y-4">
                {/* Test Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'اسم الاختبار (إنجليزي)' : 'Test Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.method_name}
                      onChange={(e) => setFormData({...formData, method_name: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter test name in English"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={formData.method_name_ar}
                      onChange={(e) => setFormData({...formData, method_name_ar: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="أدخل اسم الاختبار بالعربية"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Enter test description in English"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="أدخل وصف الاختبار بالعربية"
                    />
                  </div>
                </div>

                {/* Category and Safety Level */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'الفئة' : 'Category'}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="basic">{lang === 'ar' ? 'أساسي' : 'Basic'}</option>
                      <option value="advanced">{lang === 'ar' ? 'متقدم' : 'Advanced'}</option>
                      <option value="specialized">{lang === 'ar' ? 'متخصص' : 'Specialized'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'مستوى الأمان' : 'Safety Level'}
                    </label>
                    <select
                      value={formData.safety_level}
                      onChange={(e) => setFormData({...formData, safety_level: e.target.value as any})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">{lang === 'ar' ? 'منخفض' : 'Low'}</option>
                      <option value="medium">{lang === 'ar' ? 'متوسط' : 'Medium'}</option>
                      <option value="high">{lang === 'ar' ? 'عالي' : 'High'}</option>
                      <option value="extreme">{lang === 'ar' ? 'خطر شديد' : 'Extreme'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'وقت التحضير (دقيقة)' : 'Preparation Time (min)'}
                    </label>
                    <input
                      type="number"
                      value={formData.preparation_time}
                      onChange={(e) => setFormData({...formData, preparation_time: parseInt(e.target.value) || 5})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      min="1"
                      max="120"
                    />
                  </div>
                </div>

                {/* Color and Icon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'اللون الأساسي' : 'Primary Color'}
                    </label>
                    <input
                      type="color"
                      value={formData.color_primary}
                      onChange={(e) => setFormData({...formData, color_primary: e.target.value})}
                      className="w-full h-10 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'الأيقونة' : 'Icon'}
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="BeakerIcon"
                    />
                  </div>
                </div>

                {/* Preparation Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'خطوات التحضير (إنجليزي)' : 'Preparation Steps (English)'}
                    </label>
                    <textarea
                      value={formData.prepare || ''}
                      onChange={(e) => setFormData({...formData, prepare: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={4}
                      placeholder="Enter preparation steps in English"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'خطوات التحضير (عربي)' : 'Preparation Steps (Arabic)'}
                    </label>
                    <textarea
                      value={formData.prepare_ar || ''}
                      onChange={(e) => setFormData({...formData, prepare_ar: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={4}
                      placeholder="أدخل خطوات التحضير بالعربية"
                    />
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'نوع الاختبار' : 'Test Type'}
                    </label>
                    <input
                      type="text"
                      value={formData.test_type || ''}
                      onChange={(e) => setFormData({...formData, test_type: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="F/L, L, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'رقم الاختبار' : 'Test Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.test_number || ''}
                      onChange={(e) => setFormData({...formData, test_number: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Test number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'المرجع' : 'Reference'}
                    </label>
                    <input
                      type="text"
                      value={formData.reference || ''}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Scientific reference"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingTest(null);
                  }}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSaveTest}>
                  {editingTest ?
                    (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes') :
                    (lang === 'ar' ? 'إضافة الاختبار' : 'Add Test')
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


