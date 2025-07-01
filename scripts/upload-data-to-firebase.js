#!/usr/bin/env node

/**
 * Script to upload local JSON data files to Firebase Firestore
 * This script reads the local JSON files and uploads them to the appropriate Firestore collections
 */

const fs = require('fs');
const path = require('path');

// We'll create a consolidated JSON file that can be imported to Firebase
// This avoids the ES module import issues in Node.js

// Collection mappings
const COLLECTIONS = {
  'DatabaseColorTest.json': 'colorTests',
  'color-results.json': 'colorResults',
  'chemical-tests.json': 'chemicalTests',
  'test-instructions.json': 'testInstructions'
};

// Data directory path
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'firebase-data');

/**
 * Read and parse JSON file
 */
function readJsonFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Create Firebase import format
 */
function createFirebaseImportData() {
  console.log('🚀 Creating Firebase import data...\n');

  const firebaseData = {};

  // Process each JSON file
  for (const [fileName, collectionName] of Object.entries(COLLECTIONS)) {
    const filePath = path.join(DATA_DIR, fileName);

    console.log(`📁 Processing file: ${fileName}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    // Read and parse JSON data
    const data = readJsonFile(filePath);
    if (!data || !Array.isArray(data)) {
      console.log(`⚠️  Invalid data format in file: ${fileName}`);
      continue;
    }

    console.log(`📊 Found ${data.length} records in ${fileName}`);

    // Convert array to object with document IDs as keys
    const collectionData = {};
    data.forEach((item, index) => {
      const docId = item.id || `doc_${index + 1}`;
      const { id, ...dataWithoutId } = item;
      collectionData[docId] = dataWithoutId;
    });

    firebaseData[collectionName] = collectionData;
    console.log(`✅ Processed ${Object.keys(collectionData).length} documents for ${collectionName}`);
  }

  return firebaseData;
}

/**
 * Main function to create Firebase import files
 */
function createImportFiles() {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Create Firebase import data
    const firebaseData = createFirebaseImportData();

    // Save as JSON file for Firebase import
    const outputPath = path.join(OUTPUT_DIR, 'firebase-import.json');
    fs.writeFileSync(outputPath, JSON.stringify(firebaseData, null, 2), 'utf8');

    console.log(`\n📄 Firebase import file created: ${outputPath}`);

    // Create individual collection files
    for (const [collectionName, collectionData] of Object.entries(firebaseData)) {
      const collectionPath = path.join(OUTPUT_DIR, `${collectionName}.json`);
      fs.writeFileSync(collectionPath, JSON.stringify(collectionData, null, 2), 'utf8');
      console.log(`📄 Collection file created: ${collectionPath}`);
    }

    // Create instructions file
    const instructionsPath = path.join(OUTPUT_DIR, 'IMPORT_INSTRUCTIONS.md');
    const instructions = `# Firebase Import Instructions

## Files Created:
- \`firebase-import.json\` - Complete database structure for Firebase import
- Individual collection files for each data type

## How to Import to Firebase:

### Method 1: Using Firebase Console (Recommended)
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: colorstests-573ef
3. Go to Firestore Database
4. Click on "Import" button
5. Upload the \`firebase-import.json\` file

### Method 2: Using Firebase CLI
1. Install Firebase CLI: \`npm install -g firebase-tools\`
2. Login: \`firebase login\`
3. Set project: \`firebase use colorstests-573ef\`
4. Import data: \`firebase firestore:import firebase-data/\`

### Method 3: Manual Collection Import
Import each collection file individually:
- colorTests.json → colorTests collection
- colorResults.json → colorResults collection
- chemicalTests.json → chemicalTests collection
- testInstructions.json → testInstructions collection

## Data Summary:
${Object.entries(firebaseData).map(([name, data]) =>
  `- ${name}: ${Object.keys(data).length} documents`
).join('\n')}

## Next Steps:
1. Import the data using one of the methods above
2. Update your application to use Firebase data services
3. Test the integration thoroughly
`;

    fs.writeFileSync(instructionsPath, instructions, 'utf8');
    console.log(`📄 Instructions created: ${instructionsPath}`);

    console.log('\n🎉 Firebase import files created successfully!');
    console.log('\n📋 Summary:');
    Object.entries(firebaseData).forEach(([name, data]) => {
      console.log(`✅ ${name}: ${Object.keys(data).length} documents`);
    });

    console.log(`\n📁 All files saved to: ${OUTPUT_DIR}`);
    console.log('📖 Check IMPORT_INSTRUCTIONS.md for detailed import steps');

  } catch (error) {
    console.error('❌ Error creating import files:', error.message);
    process.exit(1);
  }
}

// Run the process
if (require.main === module) {
  createImportFiles();
}

module.exports = {
  createImportFiles,
  createFirebaseImportData,
  readJsonFile
};
