const axios = require("axios");

/* --------------------------------------------
   PHONEPE CONFIG
--------------------------------------------- */
const CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  clientId: process.env.PHONEPE_CLIENT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,
  clientVersion: process.env.PHONEPE_CLIENT_VERSION || "1.0",
  baseUrl: process.env.PHONEPE_BASE_URL,
};

/* --------------------------------------------
   TOKEN CACHE
--------------------------------------------- */
let cachedToken = null;
let tokenExpiresAt = null;

/* --------------------------------------------
   FETCH ACCESS TOKEN  (V2)
--------------------------------------------- */
async function fetchAccessToken() {
  const url = `${CONFIG.baseUrl}/apis/identity-manager/v2/oauth/token`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CONFIG.clientId,
    client_secret: CONFIG.clientSecret,
    client_version: CONFIG.clientVersion,
  }).toString();

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const res = await axios.post(url, body, { headers });

  if (!res.data.access_token) {
    throw new Error("No access_token returned from PhonePe");
  }

  cachedToken = res.data.access_token;
  tokenExpiresAt = Date.now() + res.data.expires_in * 1000 - 300000; // minus 5 min

  return cachedToken;
}

/* --------------------------------------------
   GET TOKEN (with cache)
--------------------------------------------- */
async function getAccessToken() {
  if (cachedToken && tokenExpiresAt > Date.now()) {
    return cachedToken;
  }
  return await fetchAccessToken();
}

/* --------------------------------------------
   CREATE PAYMENT REQUEST (V2)
--------------------------------------------- */
async function createPaymentRequest({
  amount,
  merchantOrderId,
  redirectUrl,
}) {
  const token = await getAccessToken();

  const url = `${CONFIG.baseUrl}/apis/pg/checkout/v2/pay`;

  const payload = {
    amount,
    merchantOrderId,
    expireAfter: 1200, // 20 minutes
    paymentFlow: {
      type: "PG_CHECKOUT",
      merchantUrls: { redirectUrl },
    },
    metaInfo: {
      udf1: "info1",
      udf2: "info2",
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `O-Bearer ${token}`,
  };

  const res = await axios.post(url, payload, { headers });

  if (!res.data.redirectUrl) {
    throw new Error("No redirectUrl received from PhonePe V2 API");
  }

  return {
    redirectUrl: res.data.redirectUrl,
    orderId: res.data.orderId,
    expireAt: res.data.expireAt,
  };
}

/* --------------------------------------------
   CHECK PAYMENT STATUS (V2)
--------------------------------------------- */
async function checkPaymentStatus(merchantOrderId) {
  const token = await getAccessToken();

  const url = `${CONFIG.baseUrl}/apis/pg/checkout/v2/${merchantOrderId}/status`;

  const headers = {
    Accept: "application/json",
    Authorization: `O-Bearer ${token}`,
  };

  const res = await axios.get(url, { headers });

  return res.data;
}

module.exports = {
  createPaymentRequest,
  checkPaymentStatus,
  getAccessToken,
};
