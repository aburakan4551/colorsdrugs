// Firebase Firestore data management service
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names for different data types
export const COLLECTIONS = {
  COLOR_TESTS: 'colorTests',
  COLOR_RESULTS: 'colorResults', 
  CHEMICAL_TESTS: 'chemicalTests',
  TEST_INSTRUCTIONS: 'testInstructions',
  USERS: 'users'
} as const;

// Type definitions for our data structures
export interface ColorTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
}

export interface ColorResult {
  id: string;
  test_id: string;
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: string;
}

export interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  category: string;
  safety_level: string;
  preparation_time: number;
  icon: string;
  color_primary: string;
  created_at: string;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
}

export interface TestInstruction {
  id: string;
  test_id: string;
  step_number: number;
  instruction: string;
  instruction_ar: string;
  safety_warning: string;
  safety_warning_ar: string;
  icon: string;
}

// Generic function to get all documents from a collection
export async function getAllDocuments<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to get a single document by ID
export async function getDocumentById<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching document ${id} from ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to add a new document
export async function addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to update a document
export async function updateDocument<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data as any);
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to delete a document
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, error);
    throw error;
  }
}

// Specific functions for each data type
export const colorTestsService = {
  getAll: () => getAllDocuments<ColorTest>(COLLECTIONS.COLOR_TESTS),
  getById: (id: string) => getDocumentById<ColorTest>(COLLECTIONS.COLOR_TESTS, id),
  add: (data: Omit<ColorTest, 'id'>) => addDocument<ColorTest>(COLLECTIONS.COLOR_TESTS, data),
  update: (id: string, data: Partial<ColorTest>) => updateDocument<ColorTest>(COLLECTIONS.COLOR_TESTS, id, data),
  delete: (id: string) => deleteDocument(COLLECTIONS.COLOR_TESTS, id)
};

export const colorResultsService = {
  getAll: () => getAllDocuments<ColorResult>(COLLECTIONS.COLOR_RESULTS),
  getById: (id: string) => getDocumentById<ColorResult>(COLLECTIONS.COLOR_RESULTS, id),
  getByTestId: async (testId: string) => {
    try {
      const q = query(collection(db, COLLECTIONS.COLOR_RESULTS), where('test_id', '==', testId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ColorResult[];
    } catch (error) {
      console.error(`Error fetching color results for test ${testId}:`, error);
      throw error;
    }
  },
  add: (data: Omit<ColorResult, 'id'>) => addDocument<ColorResult>(COLLECTIONS.COLOR_RESULTS, data),
  update: (id: string, data: Partial<ColorResult>) => updateDocument<ColorResult>(COLLECTIONS.COLOR_RESULTS, id, data),
  delete: (id: string) => deleteDocument(COLLECTIONS.COLOR_RESULTS, id)
};

export const chemicalTestsService = {
  getAll: () => getAllDocuments<ChemicalTest>(COLLECTIONS.CHEMICAL_TESTS),
  getById: (id: string) => getDocumentById<ChemicalTest>(COLLECTIONS.CHEMICAL_TESTS, id),
  getByCategory: async (category: string) => {
    try {
      const q = query(collection(db, COLLECTIONS.CHEMICAL_TESTS), where('category', '==', category));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChemicalTest[];
    } catch (error) {
      console.error(`Error fetching chemical tests for category ${category}:`, error);
      throw error;
    }
  },
  add: (data: Omit<ChemicalTest, 'id'>) => addDocument<ChemicalTest>(COLLECTIONS.CHEMICAL_TESTS, data),
  update: (id: string, data: Partial<ChemicalTest>) => updateDocument<ChemicalTest>(COLLECTIONS.CHEMICAL_TESTS, id, data),
  delete: (id: string) => deleteDocument(COLLECTIONS.CHEMICAL_TESTS, id)
};

export const testInstructionsService = {
  getAll: () => getAllDocuments<TestInstruction>(COLLECTIONS.TEST_INSTRUCTIONS),
  getById: (id: string) => getDocumentById<TestInstruction>(COLLECTIONS.TEST_INSTRUCTIONS, id),
  getByTestId: async (testId: string) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.TEST_INSTRUCTIONS), 
        where('test_id', '==', testId),
        orderBy('step_number', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TestInstruction[];
    } catch (error) {
      console.error(`Error fetching test instructions for test ${testId}:`, error);
      throw error;
    }
  },
  add: (data: Omit<TestInstruction, 'id'>) => addDocument<TestInstruction>(COLLECTIONS.TEST_INSTRUCTIONS, data),
  update: (id: string, data: Partial<TestInstruction>) => updateDocument<TestInstruction>(COLLECTIONS.TEST_INSTRUCTIONS, id, data),
  delete: (id: string) => deleteDocument(COLLECTIONS.TEST_INSTRUCTIONS, id)
};
