import axios, { AxiosError, AxiosResponse } from "axios";
import { signOut } from "next-auth/react";
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_KEY, 
  headers: {
    "Content-Type": "application/json",
  },
});
if (typeof window !== "undefined") {
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        signOut({ callbackUrl: "/auth/signin" });
      }
      return Promise.reject(error);
    }
  );
}
export async function loginVendor(username: string, password: string) {
  try {
    const res = await apiClient.post("/login", { username, password });
    console.log("Login response data:", res.data); 
    return res.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}
export async function verifyLogin(token: string) {
  try {
    const res = await apiClient.post("/verify-login", { token });
    console.log("Verify login response data:", res.data); 
    return res.data;
  } catch (error) {
    console.error("Error during verify login:", error);
    throw error;
  }
}
function getVendorHeaders() {
  return {
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
  };
}
export async function getAllVendors() {
  try {
    const res = await apiClient.get("/vendors", {
      headers: getVendorHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
export async function getVendor(id: string) {
  try {
    const res = await apiClient.get(`/vendors/${id}`, {
      headers: getVendorHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
export async function addVendor(body: any) {
  try {
    const res = await apiClient.post("/vendors", body, {
      headers: getVendorHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
export async function updateVendor(id: string, body: any) {
  try {
    const res = await apiClient.put(`/vendors/${id}`, body, {
      headers: getVendorHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
export async function deleteVendor(id: string) {
  try {
    const res = await apiClient.delete(`/vendors/${id}`, {
      headers: getVendorHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
/** POST /api/demographic */
export async function upsertDemographic(body: any, bearerToken: string) {
  try {
    const res = await apiClient.post("/api/demographic", body, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
/** GET /api/search?cursor=...&page_size=... */
export async function searchLog(cursor: string, page_size: number, bearerToken: string) {
  try {
    const res = await apiClient.get("/api/search", {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { cursor, page_size },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
/** POST /api/basic-health (Push History) */
export async function pushHistory(body: any, bearerToken: string) {
  try {
    const res = await apiClient.post("/api/basic-health", body, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
/** GET /web-api/health-areas => Bearer token */
export async function getHealthAreas(bearerToken: string) {
  try {
    const res = await apiClient.get("/web-api/health-areas", {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
/** GET /web-api/geo-areas/:id => Bearer token */
export async function getGeoAreasByID(id: number, bearerToken: string) {
  try {
    const res = await apiClient.get(`/web-api/geo-areas/${id}`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
export async function dashboardOverview(body: any, bearerToken: string) {
  try {
    const res = await axios.post("/api/proxyOverview", body, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    return res.data;
  } catch (error) {
    console.error("dashboardOverview error:", error);
    throw error;
  }
}

export async function getComparisonDisease(body: any, bearerToken: string) {
  try {
    const res = await apiClient.post("/web-api/comparison/disease", body, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching comparison disease data:", error);
    throw error;
  }
}

export async function getComparisonHealth(body: any, bearerToken: string) {
  try {
    const res = await apiClient.post("/web-api/comparison/health", body, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching comparison health data:", error);
    throw error;
  }
}