import axios from 'axios';

const BASE_URL = process.env.INTERSWITCH_BASE_URL || 'https://sandbox.interswitchng.com';
const CLIENT_ID = process.env.INTERSWITCH_CLIENT_ID!;
const CLIENT_SECRET = process.env.INTERSWITCH_CLIENT_SECRET!;

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export const getAccessToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const { data } = await axios.post(
    `${BASE_URL}/passport/oauth/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
};

export const interswitchClient = async () => {
  const token = await getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// ─── Get supported banks ──────────────────────────────────────────────────────
export const getBanks = async (): Promise<{ bankCode: string; bankName: string }[]> => {
  const client = await interswitchClient();
  const { data } = await client.get('/api/v1/quickteller/banks');
  return (data.banks || []).map((b: any) => ({ bankCode: b.bankCode, bankName: b.bankName }));
};

// ─── Resolve account name ─────────────────────────────────────────────────────
export const getAccountName = async (accountNumber: string, bankCode: string): Promise<string> => {
  const client = await interswitchClient();
  const { data } = await client.get(
    `/api/v1/nameenquiry/banks/${bankCode}/accounts/${accountNumber}`
  );
  return data.accountName;
};

// ─── Initiate funds transfer ──────────────────────────────────────────────────
export const initiateTransfer = async (payload: {
  amount: number;
  debitAccountNumber: string;
  debitBankCode: string;
  creditAccountNumber: string;
  creditBankCode: string;
  narration: string;
  requestRef: string;
}): Promise<{ responseCode: string; transactionRef: string; responseDescription: string }> => {
  const client = await interswitchClient();
  const { data } = await client.post('/api/v1/funds-transfer/transaction', {
    amount: payload.amount * 100, // kobo
    debitAccount: { accountNumber: payload.debitAccountNumber, bankCode: payload.debitBankCode },
    creditAccount: { accountNumber: payload.creditAccountNumber, bankCode: payload.creditBankCode },
    narration: payload.narration,
    requestReference: payload.requestRef,
  });
  return {
    responseCode: data.responseCode,
    transactionRef: data.transactionReference,
    responseDescription: data.responseDescription,
  };
};
