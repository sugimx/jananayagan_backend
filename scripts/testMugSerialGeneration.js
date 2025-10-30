const mongoose = require('mongoose');
const { generateMugSerial, generateMultipleMugSerials } = require('../src/utils/mugSerialGenerator');

// Test data similar to your example
const testBikeNumbers = [
  "TN10XY2345",
  "KL01AB1234", 
  "KL01AB5678",
  "TN10XY6789",
  "KL01AB4321",
  "TN22ZZ9999"
];

async function testMugSerialGeneration() {
  try {
    console.log('Testing Mug Serial Generation\n');
    console.log('Bike Number → Generated Mug Serial');
    console.log('=====================================');
    
    // Test individual serial generation
    for (const bikeNumber of testBikeNumbers) {
      try {
        const mugSerial = await generateMugSerial(bikeNumber);
        console.log(`${bikeNumber} → MugSerial: ${mugSerial}`);
      } catch (error) {
        console.log(`${bikeNumber} → Error: ${error.message}`);
      }
    }
    
    console.log('\n\nTesting Multiple Serial Generation:');
    console.log('=====================================');
    
    // Test multiple serial generation for same series
    const testSeries = "TN10XY";
    const quantities = [1, 2, 3];
    
    for (const qty of quantities) {
      try {
        const serials = await generateMultipleMugSerials(`${testSeries}1234`, qty);
        console.log(`Quantity ${qty}: ${serials.join(', ')}`);
      } catch (error) {
        console.log(`Quantity ${qty}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  // Note: This test requires database connection
  console.log('Note: This test requires a MongoDB connection.');
  console.log('Make sure to set up your database connection before running.');
  console.log('You can run this test by connecting to your database first.\n');
  

}

module.exports = { testMugSerialGeneration };
