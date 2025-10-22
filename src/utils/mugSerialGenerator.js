const mongoose = require('mongoose');
const Order = require('../models/Order');

/**
 * Generate mug serial number based on bike number
 * @param {string} bikeNumber - The bike number (e.g., "TN10XY2345")
 * @returns {Promise<string>} - The generated mug serial (e.g., "TN10XY1")
 */
const generateMugSerial = async (bikeNumber) => {
  try {
    // Extract series code (first 6 characters)
    const seriesCode = bikeNumber.substring(0, 6);
    
    // Find the highest serial number for this series in existing orders
    const existingOrders = await Order.find({
      'items.mugSerial': { $regex: `^${seriesCode}` }
    }).select('items.mugSerial');
    
    // Extract all existing serial numbers for this series
    const existingSerials = [];
    existingOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.mugSerial && item.mugSerial.startsWith(seriesCode)) {
          const serialNumber = parseInt(item.mugSerial.substring(6));
          if (!isNaN(serialNumber)) {
            existingSerials.push(serialNumber);
          }
        }
      });
    });
    
 
    const nextSerial = existingSerials.length > 0 ? Math.max(...existingSerials) + 1 : 1;
    
    return `${seriesCode}${nextSerial}`;
  } catch (error) {
    console.error('Error generating mug serial:', error);
    throw new Error('Failed to generate mug serial number');
  }
};

/**
 * Generate multiple mug serials for a given quantity
 * @param {string} bikeNumber - The bike number
 * @param {number} quantity - Number of mugs to generate serials for
 * @returns {Promise<string[]>} - Array of generated mug serials
 */
const generateMultipleMugSerials = async (bikeNumber, quantity) => {
  const serials = [];
  const seriesCode = bikeNumber.substring(0, 6);
  
  // Get the highest existing serial for this series
  const existingOrders = await Order.find({
    'items.mugSerial': { $regex: `^${seriesCode}` }
  }).select('items.mugSerial');
  
  const existingSerials = [];
  existingOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.mugSerial && item.mugSerial.startsWith(seriesCode)) {
        const serialNumber = parseInt(item.mugSerial.substring(6));
        if (!isNaN(serialNumber)) {
          existingSerials.push(serialNumber);
        }
      }
    });
  });
  
  const startSerial = existingSerials.length > 0 ? Math.max(...existingSerials) + 1 : 1;
  
  // Generate serials for the requested quantity
  for (let i = 0; i < quantity; i++) {
    const serialNumber = startSerial + i;
    serials.push(`${seriesCode}${serialNumber}`);
  }
  
  return serials;
};

module.exports = {
  generateMugSerial,
  generateMultipleMugSerials,
};
