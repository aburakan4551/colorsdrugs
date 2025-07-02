import { Language } from '@/types';
import {
  chemicalTestsService,
  colorResultsService,
  testInstructionsService,
  ChemicalTest as FirebaseChemicalTest,
  ColorResult as FirebaseColorResult,
  TestInstruction as FirebaseTestInstruction
} from '@/lib/firebase-data';

// Re-export Firebase types for compatibility
export interface ChemicalTest extends FirebaseChemicalTest {}
export interface ColorResult extends FirebaseColorResult {}
export interface TestInstruction extends FirebaseTestInstruction {}

// Legacy interfaces removed - using Firebase types

export interface TestResult {
  id: string;
  test_id: string;
  color_result_id: string;
  confidence_score: number;
  notes?: string;
  timestamp: string;
  session_id: string;
}

export interface TestSession {
  id: string;
  test_id: string;
  status: 'started' | 'in_progress' | 'completed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  results: TestResult[];
}

// Local storage keys
const STORAGE_KEYS = {
  TEST_RESULTS: 'color_testing_results',
  TEST_SESSIONS: 'color_testing_sessions',
  USER_PREFERENCES: 'color_testing_preferences',
  ADMIN_DATA: 'color_testing_admin_data',
} as const;

// Data Service Class - Updated to use Firebase
export class DataService {
  // Get all chemical tests
  static async getChemicalTests(): Promise<ChemicalTest[]> {
    try {
      return await chemicalTestsService.getAll();
    } catch (error) {
      console.error('Error fetching chemical tests:', error);
      return [];
    }
  }

  // Get chemical test by ID
  static async getChemicalTestById(id: string): Promise<ChemicalTest | null> {
    try {
      return await chemicalTestsService.getById(id);
    } catch (error) {
      console.error('Error fetching chemical test by ID:', error);
      return null;
    }
  }

  // Get chemical tests by category
  static async getChemicalTestsByCategory(category: string): Promise<ChemicalTest[]> {
    try {
      return await chemicalTestsService.getByCategory(category);
    } catch (error) {
      console.error('Error fetching chemical tests by category:', error);
      return [];
    }
  }

  // Get all color results
  static async getColorResults(): Promise<ColorResult[]> {
    try {
      return await colorResultsService.getAll();
    } catch (error) {
      console.error('Error fetching color results:', error);
      return [];
    }
  }

  // Get color results by test ID
  static async getColorResultsByTestId(testId: string): Promise<ColorResult[]> {
    try {
      return await colorResultsService.getByTestId(testId);
    } catch (error) {
      console.error('Error fetching color results by test ID:', error);
      return [];
    }
  }

  // Get color result by ID
  static async getColorResultById(id: string): Promise<ColorResult | null> {
    try {
      return await colorResultsService.getById(id);
    } catch (error) {
      console.error('Error fetching color result by ID:', error);
      return null;
    }
  }

  // Get all test instructions
  static async getTestInstructions(): Promise<TestInstruction[]> {
    try {
      return await testInstructionsService.getAll();
    } catch (error) {
      console.error('Error fetching test instructions:', error);
      return [];
    }
  }

  // Get test instructions by test ID
  static async getTestInstructionsByTestId(testId: string): Promise<TestInstruction[]> {
    try {
      return await testInstructionsService.getByTestId(testId);
    } catch (error) {
      console.error('Error fetching test instructions by test ID:', error);
      return [];
    }
  }

  // Generate unique ID
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Local Storage Operations
  static saveToLocalStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getFromLocalStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  // Test Session Management
  static createTestSession(testId: string): TestSession {
    const session: TestSession = {
      id: this.generateId(),
      test_id: testId,
      status: 'started',
      started_at: new Date().toISOString(),
      results: [],
    };

    const sessions = this.getTestSessions();
    sessions.push(session);
    this.saveToLocalStorage(STORAGE_KEYS.TEST_SESSIONS, sessions);

    return session;
  }

  static getTestSessions(): TestSession[] {
    return this.getFromLocalStorage<TestSession[]>(STORAGE_KEYS.TEST_SESSIONS) || [];
  }

  static getTestSessionById(sessionId: string): TestSession | null {
    const sessions = this.getTestSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  static updateTestSession(sessionId: string, updates: Partial<TestSession>): TestSession | null {
    const sessions = this.getTestSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex === -1) return null;

    sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
    this.saveToLocalStorage(STORAGE_KEYS.TEST_SESSIONS, sessions);

    return sessions[sessionIndex];
  }

  static completeTestSession(
    sessionId: string, 
    colorResultId: string, 
    confidenceScore: number, 
    notes?: string
  ): TestResult | null {
    const session = this.getTestSessionById(sessionId);
    if (!session) return null;

    const result: TestResult = {
      id: this.generateId(),
      test_id: session.test_id,
      color_result_id: colorResultId,
      confidence_score: confidenceScore,
      notes,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
    };

    // Update session
    this.updateTestSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      results: [...session.results, result],
    });

    // Save result separately
    const results = this.getTestResults();
    results.push(result);
    this.saveToLocalStorage(STORAGE_KEYS.TEST_RESULTS, results);

    return result;
  }

  // Test Results Management
  static getTestResults(): TestResult[] {
    return this.getFromLocalStorage<TestResult[]>(STORAGE_KEYS.TEST_RESULTS) || [];
  }

  static getTestResultsByTestId(testId: string): TestResult[] {
    const results = this.getTestResults();
    return results.filter(result => result.test_id === testId);
  }

  static deleteTestResult(resultId: string): boolean {
    const results = this.getTestResults();
    const filteredResults = results.filter(result => result.id !== resultId);
    
    if (filteredResults.length === results.length) return false;

    this.saveToLocalStorage(STORAGE_KEYS.TEST_RESULTS, filteredResults);
    return true;
  }

  // User Preferences
  static getUserPreferences() {
    return this.getFromLocalStorage(STORAGE_KEYS.USER_PREFERENCES) || {
      language: 'ar' as Language,
      theme: 'light',
      notifications: true,
      autoSave: true,
    };
  }

  static saveUserPreferences(preferences: any): void {
    this.saveToLocalStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  // Admin Data Management
  static getAdminData() {
    return this.getFromLocalStorage(STORAGE_KEYS.ADMIN_DATA) || {
      customTests: [],
      customColorResults: [],
      customInstructions: [],
      settings: {},
    };
  }

  static saveAdminData(data: any): void {
    this.saveToLocalStorage(STORAGE_KEYS.ADMIN_DATA, data);
  }

  // Helper method for getting results by confidence
  static async getResultsByConfidence(results: TestResult[]): Promise<Record<string, number>> {
    const confidenceMap: Record<string, number> = {};

    for (const result of results) {
      try {
        const colorResult = await this.getColorResultById(result.color_result_id);
        if (colorResult) {
          confidenceMap[colorResult.confidence_level] = (confidenceMap[colorResult.confidence_level] || 0) + 1;
        }
      } catch (error) {
        console.error('Error fetching color result:', error);
      }
    }

    return confidenceMap;
  }

  // Statistics and Analytics
  static async getStatistics() {
    const results = this.getTestResults();
    const sessions = this.getTestSessions();
    const tests = await this.getChemicalTests();

    const stats = {
      total_tests: tests.length,
      total_results: results.length,
      total_sessions: sessions.length,
      completed_sessions: sessions.filter(s => s.status === 'completed').length,
      tests_by_category: tests.reduce((acc, test) => {
        acc[test.category] = (acc[test.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      results_by_confidence: await this.getResultsByConfidence(results),
      recent_activity: results
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10),
    };

    return stats;
  }

  // Search and Filter
  static async searchTests(query: string, language: Language = 'ar'): Promise<ChemicalTest[]> {
    const tests = await this.getChemicalTests();
    const searchTerm = query.toLowerCase();

    return tests.filter(test => {
      const name = language === 'ar' ? test.method_name_ar : test.method_name;
      const description = language === 'ar' ? test.description_ar : test.description;
      
      return name.toLowerCase().includes(searchTerm) || 
             description.toLowerCase().includes(searchTerm) ||
             test.category.toLowerCase().includes(searchTerm);
    });
  }

  // Export/Import Data
  static exportData() {
    const data = {
      results: this.getTestResults(),
      sessions: this.getTestSessions(),
      preferences: this.getUserPreferences(),
      adminData: this.getAdminData(),
      exportDate: new Date().toISOString(),
      version: '2.0.0',
    };

    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.results) {
        this.saveToLocalStorage(STORAGE_KEYS.TEST_RESULTS, data.results);
      }
      if (data.sessions) {
        this.saveToLocalStorage(STORAGE_KEYS.TEST_SESSIONS, data.sessions);
      }
      if (data.preferences) {
        this.saveToLocalStorage(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
      }
      if (data.adminData) {
        this.saveToLocalStorage(STORAGE_KEYS.ADMIN_DATA, data.adminData);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Backup and restore
  static createBackup(): string {
    return this.exportData();
  }

  static restoreFromBackup(backupData: string): boolean {
    return this.importData(backupData);
  }
}
