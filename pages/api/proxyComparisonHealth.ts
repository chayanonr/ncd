import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_KEY}/web-api/comparison/health`;
  console.log("API URL:", apiUrl);

  try {
    const response = await axios.post(apiUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: bearerToken,
      },
    });
    res.status(200).json(response.data);
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        res.status(error.response.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}