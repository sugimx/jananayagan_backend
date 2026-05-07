require('dotenv').config();

// This is a Vercel serverless function endpoint
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const googleSheetsHelper = require('../../src/utils/googleSheetsHelper');
    const result = await googleSheetsHelper.getCupListData();
    
    return res.status(200).json({
      success: true,
      message: result.count > 0 ? 'Cup List retrieved successfully' : 'No cup list data available',
      sheetName: result.sheetName,
      count: result.count,
      data: result.data || [],
      source: 'google_sheets'
    });
  } catch (error) {
    console.error('❌ Error in cuplist endpoint:', error.message);
    return res.status(200).json({
      success: true,
      message: 'Cup List endpoint is accessible',
      count: 0,
      data: [],
      error: error.message,
      source: 'error'
    });
  }
};
