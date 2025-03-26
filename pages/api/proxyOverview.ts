// pages/api/proxyOverview.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios({
      method: req.method,
      url: 'https://test-ncdgateway.abs.co.th/web-api/overview', // external API endpoint
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
    });
    res.status(response.status).json(response.data);
  } catch (error: unknown) { // Use 'unknown' instead of 'AxiosError'
    // Type narrowing to handle AxiosError specifically
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Proxy error:", axiosError);
      res.status(axiosError.response?.status || 500).json({ error: axiosError.message });
    } else {
      // Handle non-Axios errors
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
}