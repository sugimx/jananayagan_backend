const axios = require('axios');

/**
 * PhonePe V2 Helper Utility
 * Handles OAuth token management and API interactions for PhonePe Checkout V2
 * Uses OAuth Bearer token authentication (Client ID, Client Secret, Client Version)
 */

// Configuration from environment variables
const PHONEPE_V2_CONFIG = {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    clientId: process.env.PHONEPE_CLIENT_ID,
    clientSecret: process.env.PHONEPE_CLIENT_SECRET,
    clientVersion: process.env.PHONEPE_CLIENT_VERSION || '1',
    baseUrl: process.env.PHONEPE_BASE_URL,
    oauthScope: process.env.PHONEPE_OAUTH_SCOPE,
};

// Token cache to avoid unnecessary API calls
let accessTokenCache = null;
let tokenExpiryTime = null;

// Generate an idempotent request id
const generateRequestId = (seed) => {
    const base = seed || `REQ_${Date.now()}`;
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${base}_${rand}`;
};

/**
 * Validate PhonePe V2 configuration
 * @throws {Error} If configuration is missing or invalid
 */
const validateConfig = () => {
    const missing = [];
    if (!PHONEPE_V2_CONFIG.merchantId) missing.push('PHONEPE_MERCHANT_ID');
    if (!PHONEPE_V2_CONFIG.clientId) missing.push('PHONEPE_CLIENT_ID');
    if (!PHONEPE_V2_CONFIG.clientSecret) missing.push('PHONEPE_CLIENT_SECRET');
    if (!PHONEPE_V2_CONFIG.baseUrl) missing.push('PHONEPE_BASE_URL');

    if (missing.length > 0) {
        throw new Error(`PhonePe V2 configuration missing: ${missing.join(', ')}`);
    }

    const emptyValues = [];
    if (PHONEPE_V2_CONFIG.merchantId && PHONEPE_V2_CONFIG.merchantId.trim() === '') emptyValues.push('PHONEPE_MERCHANT_ID');
    if (PHONEPE_V2_CONFIG.clientId && PHONEPE_V2_CONFIG.clientId.trim() === '') emptyValues.push('PHONEPE_CLIENT_ID');
    if (PHONEPE_V2_CONFIG.clientSecret && PHONEPE_V2_CONFIG.clientSecret.trim() === '') emptyValues.push('PHONEPE_CLIENT_SECRET');

    if (emptyValues.length > 0) {
        console.warn(`Warning: PhonePe V2 config has empty values: ${emptyValues.join(', ')}`);
    }
};

/**
 * Fetch OAuth access token from PhonePe (Updated with correct endpoint)
 * @returns {Promise<string>} Access token
 * @throws {Error} If token fetch fails
 */
const fetchAccessToken = async () => {
    validateConfig();

    const tokenUrl = `${PHONEPE_V2_CONFIG.baseUrl}/apis/pg-sandbox/v1/oauth/token`;

    try {

        console.log('Token URL:', tokenUrl);
        const requestBodyJson = {
            "client_version": PHONEPE_V2_CONFIG.clientVersion,
            "grant_type": "client_credentials",
            "client_id": PHONEPE_V2_CONFIG.clientId,
            "client_secret":PHONEPE_V2_CONFIG.clientSecret
          
        };
        
        const requestBody = new URLSearchParams(requestBodyJson).toString();

        const response = await axios.post(
            tokenUrl,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
       
        if (!response.data || !response.data.access_token) {
            throw new Error('Invalid token response from PhonePe');
        }

        const { access_token, expires_in } = response.data;

        // Cache token with 5 minute safety buffer
        const safetyBuffer = 5 * 60 * 1000;
        accessTokenCache = access_token;
        tokenExpiryTime = Date.now() + (expires_in * 1000) - safetyBuffer;
        
        console.log('PhonePe access token fetched successfully');
        return access_token;
    } catch (error) {
        console.error('Error fetching PhonePe V2 access token:', error.message);
        if (error.response) {
            console.error('Token API Error Status:', error.response.status);
            console.error('Token API Error Body:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 400) {
                console.error('PhonePe V2 Token Request Troubleshooting:');
                console.error('- 400 Bad Request usually means INVALID credentials or WRONG environment');
                console.error('- Verify credentials in PhonePe Business Dashboard match your environment');
                console.error('- Production credentials should use: https://api.phonepe.com');
                console.error('- Sandbox credentials should use: https://api-preprod.phonepe.com');
                console.error('- Regenerate credentials if they were recently created/changed');
            }
        }
        throw new Error(`Failed to fetch PhonePe V2 access token: ${error.message}`);
    }
};

/**
 * Get valid access token (use cache if available and not expired)
 * @returns {Promise<string>} Valid access token
 */
const getAccessToken = async () => {
    if (accessTokenCache && tokenExpiryTime && Date.now() < tokenExpiryTime) {
        console.log('Using cached access token');
        return accessTokenCache;
    }

    return await fetchAccessToken();
};

/**
 * Sanitize mobile number to 10 digits
 * @param {string} input - Raw phone number input
 * @returns {string} Sanitized 10-digit phone number
 */
const sanitizeMobileNumber = (input) => {
    if (!input) return '9876543210';
    const digits = String(input).replace(/\D/g, '');
    return digits.slice(-10) || '9876543210';
};

/**
 * Create payment request using PhonePe Checkout V2 API (Updated with correct structure)
 * @param {Object} paymentData - Payment request data
 * @param {number} paymentData.amount - Amount in paise
 * @param {number} [paymentData.expireAfter] - Expiry time in seconds (default: 1200)
 * @param {Object} [paymentData.metaInfo] - Additional metadata (udf1-udf15)
 * @param {string} paymentData.redirectUrl - Frontend redirect URL
 * @param {string} [paymentData.message] - Payment message for collect requests
 * @returns {Promise<Object>} Payment response with redirect URL
 */
const createPaymentRequest = async (paymentData) => {
    console.log('Payment request:', paymentData);
    try {
        validateConfig();

        const accessToken = await getAccessToken();

        // Updated: Use the correct payload structure from your snippet
        const requestBody = {
            "amount": paymentData.amount,
            "expireAfter": 1200,
            "paymentFlow": {
                "type": "PG_CHECKOUT",
                "merchantUrls": {
                    "redirectUrl": paymentData.redirectUrl
                },
                "paymentModeConfig": {
            "enabledPaymentModes": [
                {
                    "type": "UPI_INTENT"
                },
                {
                    "type": "UPI_COLLECT"
                },
                {
                    "type": "UPI_QR"
                },
            ],
            "disabledPaymentModes": [
                {
                    "type": "NET_BANKING"
                },
                {
                    "type": "CARD",
                    "cardTypes": [
                        "DEBIT_CARD",
                        "CREDIT_CARD"
                    ]
                }
            ]
        }
            },
            "merchantOrderId":paymentData.merchantTransactionId,
            "metaInfo": {
        "udf1": "additional-information-1",
        "udf2": "additional-information-2",
        "udf3": "additional-information-3",
        "udf4": "additional-information-4",
        "udf5": "additional-information-5",
        "udf6": "additional-information-6",
        "udf7": "additional-information-7",
        "udf8": "additional-information-8",
        "udf9": "additional-information-9",
        "udf10": "additional-information-10",
        "udf11": "additional-information-11",
        "udf12": "additional-information-12",
        "udf13": "additional-information-13",
        "udf14": "additional-information-14",
        "udf15": "additional-information-15"
    },
        };

        // Updated: Use the pg-sandbox endpoint path
        const paymentUrl = `${PHONEPE_V2_CONFIG.baseUrl}/apis/pg-sandbox/checkout/v2/pay`;

        // Updated: Use O-Bearer authorization format from your snippet
        const requestHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${accessToken}`,
        };

        console.log('Creating PhonePe payment with payload:', JSON.stringify(requestBody, null, 2));

        const response = await axios.post(
            paymentUrl,
            requestBody,
            { headers: requestHeaders }
        );

        console.log('PhonePe payment response:', JSON.stringify(response.data, null, 2));
        console.log('Response status:', response.status);
        console.log('Response data type:', typeof response.data);
        console.log('Response data keys:', response.data ? Object.keys(response.data) : 'null');
        
        // PhonePe V2 API returns data directly, not wrapped in success field
        // Extract redirectUrl from response
        const responseData = response.data;
        const redirectUrl = responseData?.redirectUrl;
        
        console.log('redirectUrl exists?', redirectUrl ? 'YES' : 'NO');
        console.log('redirectUrl value:', redirectUrl);
        console.log('redirectUrl type:', typeof redirectUrl);

        // Check if we have a valid redirectUrl
        if (!redirectUrl || (typeof redirectUrl === 'string' && redirectUrl.trim() === '')) {
            console.error('PhonePe V2 Payment API Response (no redirectUrl):', JSON.stringify(responseData, null, 2));
            throw new Error(
                `PhonePe V2 payment failed: ${responseData?.message || 'No redirect URL received'}`
            );
        }

        // Return the redirectUrl for frontend redirection
        return {
            success: true,
            redirectUrl: redirectUrl,
            orderId: responseData.orderId,
            state: responseData.state,
            expireAt: responseData.expireAt,
            response: responseData,
        };
    } catch (error) {
        // Check if error has response data (axios error with response)
        // Sometimes PhonePe returns valid data even with non-2xx status codes
        if (error.response && error.response.data) {
            const responseData = error.response.data;
            console.log('Error response received, checking for redirectUrl:', JSON.stringify(responseData, null, 2));
            
            // If we have redirectUrl in error response, treat it as success
            if (responseData.redirectUrl) {
                console.log('Found redirectUrl in error response, treating as success');
                return {
                    success: true,
                    redirectUrl: responseData.redirectUrl,
                    orderId: responseData.orderId,
                    state: responseData.state,
                    expireAt: responseData.expireAt,
                    response: responseData,
                };
            }
            
            console.error('Payment API Error Status:', error.response.status);
            console.error('Payment API Error Headers:', error.response.headers);
            console.error('Payment API Error Body:', JSON.stringify(responseData, null, 2));
        } else {
            console.error('Error creating PhonePe V2 payment:', error.message);
        }

        const apiMsg = error.response?.data?.message || error.message;
        throw new Error(`PhonePe V2 API call failed: ${apiMsg}`);
    }
};

/**
 * Check payment status using PhonePe V2 API
 * @param {string} merchantTransactionId - Transaction ID to check
 * @returns {Promise<Object>} Payment status details
 */
const checkPaymentStatus = async (merchantTransactionId) => {
    try {
        validateConfig();

        const accessToken = await getAccessToken();

        const statusUrl = `${PHONEPE_V2_CONFIG.baseUrl}/apis/pg-sandbox/checkout/v2/order/${merchantTransactionId}/status`;

        console.log('Checking PhonePe V2 payment status:', merchantTransactionId);

        const statusHeaders = {
            'Accept': 'application/json',
            'Authorization': `O-Bearer ${accessToken}`,
        };

        const response = await axios.get(statusUrl, { headers: statusHeaders });

        console.log('PhonePe V2 status check response:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error checking PhonePe V2 payment status:', error.message);
        if (error.response) {
            console.error('Status API Error:', JSON.stringify(error.response.data, null, 2));
        }
        throw new Error(`Failed to check payment status: ${error.message}`);
    }
};

/**
 * Process refund using PhonePe V2 API
 * @param {Object} refundData - Refund data
 * @param {string} refundData.originalTransactionId - Original transaction ID
 * @param {number} refundData.amount - Refund amount in paise
 * @param {string} refundData.merchantRefundId - Unique refund ID
 * @returns {Promise<Object>} Refund response
 */
const processRefund = async (refundData) => {
    try {
        validateConfig();

        const accessToken = await getAccessToken();

        const refundUrl = `${PHONEPE_V2_CONFIG.baseUrl}/apis/pg-sandbox/payments/v2/refund`;

        const payload = {
            merchantId: PHONEPE_V2_CONFIG.merchantId,
            originalTransactionId: refundData.originalTransactionId,
            merchantRefundId: refundData.merchantRefundId,
            amount: refundData.amount,
            callbackUrl: refundData.callbackUrl,
        };

        console.log('Processing PhonePe V2 refund:', refundData.merchantRefundId);

        const refundHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `O-Bearer ${accessToken}`,
        };

        const response = await axios.post(
            refundUrl,
            payload,
            { headers: refundHeaders }
        );

        console.log('PhonePe V2 refund response:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error processing PhonePe V2 refund:', error.message);
        if (error.response) {
            console.error('Refund API Error:', JSON.stringify(error.response.data, null, 2));
        }
        throw new Error(`Failed to process refund: ${error.message}`);
    }
};

/**
 * Clear cached access token (useful for testing or forced refresh)
 */
const clearTokenCache = () => {
    accessTokenCache = null;
    tokenExpiryTime = null;
    console.log('PhonePe V2 token cache cleared');
};

module.exports = {
    validateConfig,
    fetchAccessToken,
    getAccessToken,
    createPaymentRequest,
    checkPaymentStatus,
    processRefund,
    sanitizeMobileNumber,
    clearTokenCache,
    PHONEPE_V2_CONFIG,
};