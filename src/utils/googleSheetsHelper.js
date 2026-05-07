const { GoogleSpreadsheet } = require('google-spreadsheet');

/**
 * Google Sheets Helper Utility
 * Updates Google Sheets when payments are received
 * Requires GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON environment variables
 * 
 * Dependencies:
 * - google-spreadsheet: ^3.3.0 (CommonJS compatible)
 */

const GOOGLE_CONFIG = {
  sheetId: process.env.GOOGLE_SHEET_ID,
  serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
};

const validateConfig = () => {
  if (!GOOGLE_CONFIG.sheetId) {
    throw new Error('Google Sheets configuration missing: GOOGLE_SHEET_ID');
  }
  if (!GOOGLE_CONFIG.serviceAccountJson) {
    throw new Error('Google Sheets configuration missing: GOOGLE_SERVICE_ACCOUNT_JSON');
  }
};

/**
 * Parse service account JSON from environment variable
 */
const getServiceAccountAuth = () => {
  try {
    const serviceAccount = JSON.parse(GOOGLE_CONFIG.serviceAccountJson);
    return serviceAccount;
  } catch (error) {
    throw new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: ${error.message}`);
  }
};

/**
 * Initialize authenticated Google Sheets document
 */
const getAuthenticatedDoc = async () => {
  const serviceAccount = getServiceAccountAuth();
  const doc = new GoogleSpreadsheet(GOOGLE_CONFIG.sheetId);
  
  await doc.useServiceAccountAuth(serviceAccount);
  await doc.loadInfo();
  
  return doc;
};

/**
 * Get the payment sheet (create if needed)
 */
const getPaymentSheet = async (doc) => {
  // Try to get the Cashfree Payments sheet
  let sheet = doc.sheetsByTitle['Cashfree Payments'];
  
  if (!sheet) {
    // If it doesn't exist, use the first sheet
    sheet = doc.sheetsByIndex[0];
  }
  
  return sheet;
};

/**
 * Add a row to the Google Sheet with payment details
 * paymentData: {
 *   orderId,
 *   orderStatus,
 *   amount,
 *   customerName,
 *   customerEmail,
 *   customerPhone,
 *   transactionId,
 *   paymentTime,
 *   customFields: { fieldName: value } (optional)
 * }
 */
const addPaymentToSheet = async (paymentData) => {
  try {
    validateConfig();

    const doc = await getAuthenticatedDoc();
    const paymentSheet = await getPaymentSheet(doc);
    const firstSheet = doc.sheetsByIndex[0];

    console.log(`Connected to Google Sheet: ${paymentSheet.title}`);

    // Prepare complete row data with all fields for Cashfree Payments sheet
    const completeRowData = {
      'Order ID': paymentData.orderId || '',
      'Order Status': paymentData.orderStatus || '',
      'Amount': paymentData.amount || '',
      'Customer Name': paymentData.customerName || '',
      'Customer Email': paymentData.customerEmail || '',
      'Customer Phone': paymentData.customerPhone || '',
      'Transaction ID': paymentData.transactionId || '',
      'Payment Time': paymentData.paymentTime || new Date().toISOString(),
      ...paymentData.customFields, // Add any additional custom fields
    };

    // Add row to Cashfree Payments sheet with all columns
    await paymentSheet.addRow(completeRowData);
    console.log(`✓ Payment added to ${paymentSheet.title}: ${paymentData.orderId}`);

    // Add to first sheet if it's different - with intelligent column mapping
    if (firstSheet.title !== paymentSheet.title) {
      try {
        // Reload to get the latest header info
        await firstSheet.loadHeaderRow();
        
        // Get headers from first sheet
        const firstSheetHeaders = firstSheet.headerValues;
        
        if (!firstSheetHeaders || firstSheetHeaders.length === 0) {
          console.warn(`⚠ First sheet "${firstSheet.title}" has no headers, skipping`);
        } else {
          // Get all existing rows to calculate next No and Cup values
          const existingRows = await firstSheet.getRows();
          
          // Calculate next No value (auto-increment)
          let nextNo = 1;
          let nextCup = 1;
          
          if (existingRows.length > 0) {
            // Find max No value
            const noValues = existingRows
              .map(r => parseInt(r['No']) || 0)
              .filter(n => n > 0);
            if (noValues.length > 0) {
              nextNo = Math.max(...noValues) + 1;
            }
            
            // Find max Cup value
            const cupValues = existingRows
              .map(r => parseInt(r['Cup']) || 0)
              .filter(c => c > 0);
            if (cupValues.length > 0) {
              nextCup = Math.max(...cupValues) + 1;
            }
          }
          
          // Create mapping for customer data based on available columns
          const firstSheetData = {};
          
          // Direct column mappings for Cup List sheet
          const directMappings = {
            'No': nextNo,  // Auto-increment
            'Cup': nextCup,  // Auto-increment
            'Name': paymentData.customerName,
            'Phone': paymentData.customerPhone,
            'Email': paymentData.customerEmail,
            'Address': paymentData.customFields?.['Address'] || '',
            'Location': paymentData.customFields?.['Location'] || '',
            'State': paymentData.customFields?.['State'] || '',
            'Pincode': paymentData.customFields?.['Pincode'] || '',
            'Order ID': paymentData.orderId,
            'Order Status': paymentData.orderStatus,
            'Amount': paymentData.amount,
            'Customer Email': paymentData.customerEmail,
            'Customer Name': paymentData.customerName,
            'Customer Phone': paymentData.customerPhone,
            'Transaction ID': paymentData.transactionId,
            'Payment Time': paymentData.paymentTime,
          };
          
          // Add all mapped columns that exist in the sheet
          firstSheetHeaders.forEach((header) => {
            if (header && directMappings.hasOwnProperty(header)) {
              const value = directMappings[header];
              if (value || value === 0) {  // Include 0 values
                firstSheetData[header] = value;
              }
            }
          });
          
          // Only add if we have data to add
          if (Object.keys(firstSheetData).length > 0) {
            await firstSheet.addRow(firstSheetData);
            console.log(`✓ Payment also added to ${firstSheet.title}: ${paymentData.orderId}`);
            console.log(`  No: ${nextNo}, Cup: ${nextCup}`);
            console.log(`  Columns: ${Object.keys(firstSheetData).join(', ')}`);
          } else {
            console.warn(`⚠ No matching columns found in "${firstSheet.title}"`);
          }
        }
      } catch (firstSheetError) {
        console.warn(`⚠ Could not add to first sheet: ${firstSheetError.message}`);
        // Continue - payment is in Cashfree Payments sheet
      }
    }

    return { success: true, message: 'Payment added to Google Sheet' };
  } catch (error) {
    console.error('Error adding payment to Google Sheet:', error.message);
    throw error;
  }
};

/**
 * Add a Cashfree webhook payment to the sheet
 * Expects webhook payload in Cashfree format
 */
const addCashfreeWebhookToSheet = async (webhookPayload) => {
  try {
    // Extract data from Cashfree webhook payload
    const orderData = webhookPayload.data?.order || {};
    const formData = webhookPayload.data?.form || {};
    const customerDetails = orderData.customer_details || {};
    const amountDetails = orderData.amount_details || [];

    // Calculate total amount from amount_details
    const totalAmount = amountDetails.reduce((sum, item) => sum + (item.value || 0), 0);

    // Build custom fields from customer fields
    const customFields = {};
    if (customerDetails.customer_fields && Array.isArray(customerDetails.customer_fields)) {
      customerDetails.customer_fields.forEach((field) => {
        if (field.title && field.value) {
          customFields[field.title] = field.value;
        }
      });
    }

    // Add amount details as custom fields too
    let itemIndex = 1;
    amountDetails.forEach((detail) => {
      customFields[`Item ${itemIndex}`] = detail.title || 'Unknown';
      customFields[`Item ${itemIndex} Value`] = detail.value || 0;
      if (detail.quantity) {
        customFields[`Item ${itemIndex} Quantity`] = detail.quantity;
      }
      itemIndex++;
    });

    const paymentData = {
      orderId: orderData.order_id || '',
      orderStatus: orderData.order_status || 'PENDING',
      amount: totalAmount || orderData.order_amount || 0,
      customerName: customerDetails.customer_name || '',
      customerEmail: customerDetails.customer_email || '',
      customerPhone: customerDetails.customer_phone || '',
      transactionId: orderData.transaction_id || '',
      paymentTime: webhookPayload.event_time || new Date().toISOString(),
      customFields: {
        'Form ID': formData.form_id || '',
        'CF Form ID': formData.cf_form_id || '',
        'Form URL': formData.form_url || '',
        'Form Currency': formData.form_currency || 'INR',
        // Extract customer fields for Cup List mapping
        'Address': customFields['Address'] || '',
        'Location': customFields['Location'] || '',
        'State': customFields['State'] || '',
        'Pincode': customFields['Pincode'] || '',
        'Cup': customFields['Cup'] || '',
        ...customFields,
      }
    };

    return await addPaymentToSheet(paymentData);
  } catch (error) {
    console.error('Error adding Cashfree webhook to Google Sheet:', error.message);
    throw error;
  }
};

/**
 * Get payment history from the sheet
 * (Optional helper function)
 */
const getPaymentHistory = async (filters = {}) => {
  try {
    validateConfig();

    const doc = await getAuthenticatedDoc();
    const sheet = await getPaymentSheet(doc);
    const rows = await sheet.getRows();

    // Map rows to objects with column headers
    let results = rows.map(row => {
      const obj = {};
      // Get all headers from the sheet
      sheet.headerValues.forEach((header, idx) => {
        obj[header] = row[header] || '';
      });
      return obj;
    });
    
    if (filters.orderId) {
      results = results.filter(row => row['Order ID'] === filters.orderId);
    }
    if (filters.customerEmail) {
      results = results.filter(row => row['Customer Email'] === filters.customerEmail);
    }

    return { success: true, data: results };
  } catch (error) {
    console.error('Error fetching payment history:', error.message);
    throw error;
  }
};

/**
 * Get all Cup List data from the first sheet
 * @returns { success: bool, data: array, count: number }
 */
const getCupListData = async () => {
  try {
    validateConfig();

    const doc = await getAuthenticatedDoc();
    const cupListSheet = doc.sheetsByIndex[0];  // Cup List is always first sheet
    
    await cupListSheet.loadHeaderRow();
    const rows = await cupListSheet.getRows();

    // Map rows to objects with column headers
    const results = rows.map(row => {
      const obj = {};
      cupListSheet.headerValues.forEach((header) => {
        obj[header] = row[header] || '';
      });
      return obj;
    });

    return { 
      success: true, 
      data: results,
      count: results.length,
      sheetName: cupListSheet.title
    };
  } catch (error) {
    console.error('Error fetching Cup List data:', error.message);
    throw error;
  }
};

/**
 * Get Cup List data with filters
 * @param {object} filters - Filter criteria (e.g., { name: 'Mohit', phone: '9999999999' })
 * @param {number} limit - Limit results (optional)
 * @returns { success: bool, data: array, count: number }
 */
const getCupListDataByFilter = async (filters = {}, limit = null) => {
  try {
    validateConfig();

    const doc = await getAuthenticatedDoc();
    const cupListSheet = doc.sheetsByIndex[0];
    
    await cupListSheet.loadHeaderRow();
    const rows = await cupListSheet.getRows();

    // Map rows to objects with column headers
    let results = rows.map(row => {
      const obj = {};
      cupListSheet.headerValues.forEach((header) => {
        obj[header] = row[header] || '';
      });
      return obj;
    });

    // Apply filters
    Object.keys(filters).forEach(filterKey => {
      const filterValue = filters[filterKey];
      results = results.filter(row => {
        const rowValue = String(row[filterKey] || '').toLowerCase();
        const searchValue = String(filterValue).toLowerCase();
        return rowValue.includes(searchValue);
      });
    });

    // Apply limit if specified
    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }

    return { 
      success: true, 
      data: results,
      count: results.length,
      sheetName: cupListSheet.title,
      filtersApplied: filters
    };
  } catch (error) {
    console.error('Error fetching filtered Cup List data:', error.message);
    throw error;
  }
};

module.exports = {
  addPaymentToSheet,
  addCashfreeWebhookToSheet,
  getPaymentHistory,
  getCupListData,
  getCupListDataByFilter,
};
