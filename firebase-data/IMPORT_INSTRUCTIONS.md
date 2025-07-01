# Firebase Import Instructions

## Files Created:
- `firebase-import.json` - Complete database structure for Firebase import
- Individual collection files for each data type

## How to Import to Firebase:

### Method 1: Using Firebase Console (Recommended)
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: colorstests-573ef
3. Go to Firestore Database
4. Click on "Import" button
5. Upload the `firebase-import.json` file

### Method 2: Using Firebase CLI
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Set project: `firebase use colorstests-573ef`
4. Import data: `firebase firestore:import firebase-data/`

### Method 3: Manual Collection Import
Import each collection file individually:
- colorTests.json → colorTests collection
- colorResults.json → colorResults collection
- chemicalTests.json → chemicalTests collection
- testInstructions.json → testInstructions collection

## Data Summary:
- colorTests: 21 documents
- colorResults: 55 documents
- chemicalTests: 14 documents
- testInstructions: 27 documents

## Next Steps:
1. Import the data using one of the methods above
2. Update your application to use Firebase data services
3. Test the integration thoroughly
