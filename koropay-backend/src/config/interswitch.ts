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
