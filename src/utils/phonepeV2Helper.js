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
    clientVersion: process.env.PHONEPE_CLIENT_VERSION,
    baseUrl: process.env.PHONEPE_BASE_URL
};

// Token cache to avoid unnecessary API calls
let accessTokenCache = null;
let tokenExpiryTime = null;

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
 * Fetch OAuth access token from PhonePe
 * @returns {Promise<string>} Access token
 * @throws {Error} If token fetch fails
 */
const fetchAccessToken = async () => {
    try {
        validateConfig();

        // Debug: Log configuration (sanitized)
        console.log('PhonePe V2 Config:', {
            merchantId: PHONEPE_V2_CONFIG.merchantId ? '***set***' : 'MISSING',
            clientId: PHONEPE_V2_CONFIG.clientId ? '***set***' : 'MISSING',
            clientSecret: PHONEPE_V2_CONFIG.clientSecret ? '***set***' : 'MISSING',
            clientVersion: PHONEPE_V2_CONFIG.clientVersion || 'MISSING',
            baseUrl: PHONEPE_V2_CONFIG.baseUrl || 'MISSING'
        });

        const tokenUrl = `${PHONEPE_V2_CONFIG.baseUrl}/apis/identity-manager/v1/oauth/token`;

        // PhonePe V2 expects credentials in Basic Auth header
        const credentials = Buffer.from(
            `${PHONEPE_V2_CONFIG.clientId}:${PHONEPE_V2_CONFIG.clientSecret}`
        ).toString('base64');

        // PhonePe V2 OAuth token endpoint requires form-urlencoded format
        // PhonePe V2 requires client_id and client_secret in body
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', PHONEPE_V2_CONFIG.clientId);
        params.append('client_secret', PHONEPE_V2_CONFIG.clientSecret);

        // Log sanitized token request params and headers
        console.log('PhonePe V2 token request:', {
            url: tokenUrl,
            body: {
                grant_type: "client_credentials",
                client_id: '***set***',
                client_secret: '***set***'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ***redacted***',
            }
        });

        const response = await axios.post(
            tokenUrl,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`,
                },
            }
        );

        if (!response.data || !response.data.access_token) {
            throw new Error('Invalid token response from PhonePe');
        }

        const { access_token, expires_in } = response.data;

        // Cache token with 5 minutes safety buffer before expiry
        const safetyBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
        accessTokenCache = access_token;
        tokenExpiryTime = Date.now() + (expires_in * 1000) - safetyBuffer;

        console.log('PhonePe V2 access token fetched successfully');
        return access_token;
    } catch (error) {
        console.error('Error fetching PhonePe V2 access token:', error.message);
        if (error.response) {
            console.error('Token API Error Status:', error.response.status);
            console.error('Token API Error Body:', JSON.stringify(error.response.data, null, 2));

            // Provide helpful error context for 400 errors
            if (error.response.status === 400) {
                console.error('PhonePe V2 Token Request Troubleshooting:');
                console.error('- 400 Bad Request usually means INVALID credentials or WRONG environment');
                console.error('- Verify credentials in PhonePe Business Dashboard match your environment');
                console.error('- Production credentials should use: https://api.phonepe.com');
                console.error('- Regenerate credentials if they were recently created/changed');
                console.error('- Check baseUrl in .env file matches your credentials environment');
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
    // Return cached token if it exists and hasn't expired
    if (accessTokenCache && tokenExpiryTime && Date.now() < tokenExpiryTime) {
        return accessTokenCache;
    }

    // Fetch new token
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
 * Create payment request using PhonePe Checkout V2 API
 * @param {Object} paymentData - Payment request data
 * @param {string} paymentData.merchantTransactionId - Unique transaction ID
 * @param {string} paymentData.userId - User ID
 * @param {number} paymentData.amount - Amount in paise
 * @param {string} paymentData.redirectUrl - Frontend redirect URL
 * @param {string} paymentData.callbackUrl - Backend callback URL
 * @param {string} paymentData.mobileNumber - Customer mobile number
 * @returns {Promise<Object>} Payment response with redirect URL
 */
const createPaymentRequest = async (paymentData) => {
    try {
        validateConfig();

        const payload = {
            merchantId: process.env.PHONEPE_MERCHANT_ID,
            merchantTransactionId: paymentData.merchantTransactionId,
            merchantUserId: paymentData.userId,
            amount: paymentData.amount,
            redirectUrl: paymentData.redirectUrl,
            callbackUrl: paymentData.callbackUrl,
            mobileNumber: sanitizeMobileNumber(paymentData.mobileNumber),
            redirectMode: 'REDIRECT',
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };

        const paymentUrl = `${PHONEPE_V2_CONFIG.baseUrl}/apis/pg/checkout/v2/pay`;

        console.log('Creating PhonePe V2 payment request:', {
            url: paymentUrl,
            merchantTransactionId: paymentData.merchantTransactionId,
        });

        // PhonePe V2 uses OAuth Bearer token authentication (not checksum/Salt Key)
        // Get OAuth access token
        const accessToken = await getAccessToken();

        // Build headers for V2 API (JSON body)
        // PhonePe V2 requires: Authorization Bearer token, X-CLIENT-ID, X-CLIENT-VERSION
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-CLIENT-ID': 'SU2510231530375754659666',
            'X-REQUEST-ID': 'TXN_2157204999_VWBEKA',
            'X-CLIENT-VERSION': '1.0'
        };
        // Include client version only if explicitly configured for your merchant
        if (PHONEPE_V2_CONFIG.clientVersion) {
            headers['X-CLIENT-VERSION'] = PHONEPE_V2_CONFIG.clientVersion;
        }

        const sanitizedHeaders = { ...headers, Authorization: 'Bearer ***redacted***' };
        console.log('PhonePe V2 payment payload (json):', JSON.stringify(payload));
        console.log('PhonePe V2 payment headers:', sanitizedHeaders);

        const response = await axios.post(
            paymentUrl,
            payload,
            { headers }
        );

        if (!response.data || response.data.code !== 'PAYMENT_INITIATED') {
            console.error('PhonePe V2 Payment API Response:', JSON.stringify(response.data, null, 2));
            throw new Error(
                `PhonePe V2 payment failed: ${response.data?.message || 'Unknown error'}`
            );
        }

        const redirectUrl = response.data?.data?.redirectUrl;
        if (!redirectUrl) {
            throw new Error('No redirect URL received from PhonePe V2');
        }

        console.log('PhonePe V2 payment created successfully');

        return {
            success: true,
            merchantTransactionId: paymentData.merchantTransactionId,
            redirectUrl,
            response: response.data,
        };
    } catch (error) {
        console.error('Error creating PhonePe V2 payment:', error.message);
        if (error.response) {
            console.error('Payment API Error Status:', error.response.status);
            console.error('Payment API Error Headers:', error.response.headers);
            console.error('Payment API Error Body:', JSON.stringify(error.response.data, null, 2));
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

        const statusUrl = `${PHONEPE_V2_CONFIG.baseUrl}/apis/pg/checkout/v2/order/${merchantTransactionId}/status`;

        console.log('Checking PhonePe V2 payment status:', merchantTransactionId);

        const statusHeaders = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-CLIENT-ID': PHONEPE_V2_CONFIG.clientId,
        };
        if (PHONEPE_V2_CONFIG.clientVersion) {
            statusHeaders['X-CLIENT-VERSION'] = PHONEPE_V2_CONFIG.clientVersion;
        }

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

        const refundUrl = `${PHONEPE_V2_CONFIG.baseUrl}/apis/pg/payments/v2/refund`;

        const payload = {
            merchantId: PHONEPE_V2_CONFIG.merchantId,
            originalTransactionId: refundData.originalTransactionId,
            merchantRefundId: refundData.merchantRefundId,
            amount: refundData.amount,
            callbackUrl: refundData.callbackUrl,
        };

        console.log('Processing PhonePe V2 refund:', refundData.merchantRefundId);

        // Encode refund body as URL-encoded
        const refundParams = new URLSearchParams();
        refundParams.append('merchantId', payload.merchantId);
        refundParams.append('originalTransactionId', payload.originalTransactionId);
        refundParams.append('merchantRefundId', payload.merchantRefundId);
        refundParams.append('amount', String(payload.amount));
        if (payload.callbackUrl) refundParams.append('callbackUrl', payload.callbackUrl);

        const refundHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-CLIENT-ID': 'SU2510231530375754659666',  
            'X-REQUEST-ID': 'TXN_2157204999_VWBEKA',
            'X-CLIENT-VERSION': '1.0'
        };
        if (PHONEPE_V2_CONFIG.clientVersion) {
            refundHeaders['X-CLIENT-VERSION'] = PHONEPE_V2_CONFIG.clientVersion;
        }

        const response = await axios.post(
            refundUrl,
            refundParams.toString(),
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

