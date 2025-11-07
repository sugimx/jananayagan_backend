const mongoose = require('mongoose');
const Order = require('../models/Order');

/**
 * Generate mug serial number based on state code
 * @param {string} stateCode - The state code (e.g., "TN01", "KL13")
 * @returns {Promise<string>} - The generated mug serial (e.g., "TN01 0000001")
 */
const generateMugSerial = async (stateCode) => {
  try {
    // Normalize state code (should be 4 characters like "TN01", "KL13")
    const normalizedStateCode = stateCode.trim().toUpperCase();
    
    console.log(`[MugSerialGenerator] Generating single serial for state code: ${normalizedStateCode}`);
    
    // Get all orders that have mugSerial (more reliable than regex on arrays)
    // We'll filter in JavaScript to handle both array and string formats
    const allOrders = await Order.find({
      'items.mugSerial': { $exists: true, $ne: null }
    }).select('items.mugSerial');
    
    console.log(`[MugSerialGenerator] Found ${allOrders.length} orders with mugSerial field`);
    
    // Extract all existing serial numbers for this state code
    const existingSerials = [];
    allOrders.forEach(order => {
      order.items.forEach(item => {
        // Skip if mugSerial is null, undefined, or empty array
        if (item.mugSerial && 
            (Array.isArray(item.mugSerial) ? item.mugSerial.length > 0 : true)) {
          // Handle both array format (new) and string format (legacy)
          const serialsArray = Array.isArray(item.mugSerial) ? item.mugSerial : [item.mugSerial];
          serialsArray.forEach(serial => {
            if (typeof serial === 'string') {
              // Handle comma-separated strings (legacy format)
              const serialParts = serial.split(',');
              serialParts.forEach(part => {
                const trimmedPart = part.trim();
                // Match format: "TN01 0000001" or "TN01 1" or legacy formats
                // Check if it starts with the normalized state code
                if (trimmedPart.toUpperCase().startsWith(normalizedStateCode)) {
                  // Extract number after state code and space
                  // Pattern: STATE_CODE followed by optional space and digits
                  const match = trimmedPart.match(new RegExp(`^${normalizedStateCode}\\s*(\\d+)`, 'i'));
                  if (match && match[1]) {
                    const serialNumber = parseInt(match[1], 10);
                    if (!isNaN(serialNumber) && serialNumber > 0) {
                      existingSerials.push(serialNumber);
                      console.log(`[MugSerialGenerator] Found existing serial: ${trimmedPart} -> number: ${serialNumber}`);
                    }
                  }
                }
              });
            }
          });
        }
      });
    });
    
    console.log(`[MugSerialGenerator] Total existing serials found: ${existingSerials.length}`);
    if (existingSerials.length > 0) {
      console.log(`[MugSerialGenerator] Max existing serial: ${Math.max(...existingSerials)}`);
    }
    
    const nextSerial = existingSerials.length > 0 ? Math.max(...existingSerials) + 1 : 1;
    
    console.log(`[MugSerialGenerator] Next serial number: ${nextSerial}`);
    
    // Format: STATE_CODE SPACE 7_DIGIT_NUMBER (e.g., "TN01 0000001")
    const generatedSerial = `${normalizedStateCode} ${String(nextSerial).padStart(7, '0')}`;
    console.log(`[MugSerialGenerator] Generated serial: ${generatedSerial}`);
    return generatedSerial;
  } catch (error) {
    console.error('Error generating mug serial:', error);
    throw new Error('Failed to generate mug serial number');
  }
};

/**
 * Generate multiple mug serials for a given quantity
 * @param {string} stateCode - The state code (e.g., "TN01", "KL13")
 * @param {number} quantity - Number of mugs to generate serials for
 * @returns {Promise<string[]>} - Array of generated mug serials (e.g., ["TN01 0000001", "TN01 0000002"])
 */
const generateMultipleMugSerials = async (stateCode, quantity) => {
  const serials = [];
  // Normalize state code (should be 4 characters like "TN01", "KL13")
  const normalizedStateCode = stateCode.trim().toUpperCase();
  
  console.log(`[MugSerialGenerator] Generating serials for state code: ${normalizedStateCode}, quantity: ${quantity}`);
  
  // Get all orders that have mugSerial (more reliable than regex on arrays)
  // We'll filter in JavaScript to handle both array and string formats
  const allOrders = await Order.find({
    'items.mugSerial': { $exists: true, $ne: null }
  }).select('items.mugSerial');
  
  console.log(`[MugSerialGenerator] Found ${allOrders.length} orders with mugSerial field`);
  
  const existingSerials = [];
  allOrders.forEach(order => {
    order.items.forEach(item => {
      // Skip if mugSerial is null, undefined, or empty array
      if (item.mugSerial && 
          (Array.isArray(item.mugSerial) ? item.mugSerial.length > 0 : true)) {
        // Handle both array format (new) and string format (legacy)
        const serialsArray = Array.isArray(item.mugSerial) ? item.mugSerial : [item.mugSerial];
        serialsArray.forEach(serial => {
          if (typeof serial === 'string') {
            // Handle comma-separated strings (legacy format)
            const serialParts = serial.split(',');
            serialParts.forEach(part => {
              const trimmedPart = part.trim();
              // Match format: "TN01 0000001" or "TN01 1" or legacy formats
              // Check if it starts with the normalized state code
              if (trimmedPart.toUpperCase().startsWith(normalizedStateCode)) {
                // Extract number after state code and space
                // Pattern: STATE_CODE followed by optional space and digits
                const match = trimmedPart.match(new RegExp(`^${normalizedStateCode}\\s*(\\d+)`, 'i'));
                if (match && match[1]) {
                  const serialNumber = parseInt(match[1], 10);
                  if (!isNaN(serialNumber) && serialNumber > 0) {
                    existingSerials.push(serialNumber);
                    console.log(`[MugSerialGenerator] Found existing serial: ${trimmedPart} -> number: ${serialNumber}`);
                  }
                }
              }
            });
          }
        });
      }
    });
  });
  
  console.log(`[MugSerialGenerator] Total existing serials found: ${existingSerials.length}`);
  if (existingSerials.length > 0) {
    console.log(`[MugSerialGenerator] Existing serial numbers:`, existingSerials);
    console.log(`[MugSerialGenerator] Max existing serial: ${Math.max(...existingSerials)}`);
  }
  
  const startSerial = existingSerials.length > 0 ? Math.max(...existingSerials) + 1 : 1;
  
  console.log(`[MugSerialGenerator] Starting serial number: ${startSerial}`);
  
  // Generate serials for the requested quantity
  // Format: STATE_CODE SPACE 7_DIGIT_NUMBER (e.g., "TN01 0000001")
  for (let i = 0; i < quantity; i++) {
    const serialNumber = startSerial + i;
    const generatedSerial = `${normalizedStateCode} ${String(serialNumber).padStart(7, '0')}`;
    serials.push(generatedSerial);
    console.log(`[MugSerialGenerator] Generated serial ${i + 1}/${quantity}: ${generatedSerial}`);
  }
  
  console.log(`[MugSerialGenerator] Final generated serials:`, serials);
  return serials;
};

module.exports = {
  generateMugSerial,
  generateMultipleMugSerials,
};
