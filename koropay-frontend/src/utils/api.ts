const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const savedUser = localStorage.getItem("koropay_user");
  const token = savedUser ? JSON.parse(savedUser).token : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Something went wrong" }));
    throw new Error(error.message || "Something went wrong");
  }

  return response.status !== 204 ? response.json() : (null as T);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (phone: string, password: string) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ phone, password }) }),
  me: () => apiRequest("/auth/me"),
};

// ─── Driver ───────────────────────────────────────────────────────────────────
export const driverApi = {
  getDashboard: () => apiRequest("/driver/dashboard"),
  getRoutes: () => apiRequest("/driver/routes"),
  createRoute: (data: { routeName: string; fare: number; dropPoints: { name: string }[] }) =>
    apiRequest("/driver/routes", { method: "POST", body: JSON.stringify(data) }),
  deleteRoute: (id: string) =>
    apiRequest(`/driver/routes/${id}`, { method: "DELETE" }),
  getTrips: () => apiRequest("/driver/trips"),
  startTrip: (routeId: string) =>
    apiRequest("/driver/trips", { method: "POST", body: JSON.stringify({ routeId }) }),
  addPayment: (tripId: string, data: { passengerName: string; passengerPhone: string; dropPoint?: string }) =>
    apiRequest(`/driver/trips/${tripId}/payments`, { method: "POST", body: JSON.stringify(data) }),
  endTrip: (tripId: string) =>
    apiRequest(`/driver/trips/${tripId}/end`, { method: "PATCH" }),
  getLevies: () => apiRequest("/driver/levies"),
  requestLevyOTP: (levyId: string) =>
    apiRequest(`/driver/levies/${levyId}/request-otp`, { method: "POST" }),
  verifyLevyOTP: (levyId: string, otp: string) =>
    apiRequest(`/driver/levies/${levyId}/verify-otp`, { method: "POST", body: JSON.stringify({ otp }) }),
};

// ─── Agent ────────────────────────────────────────────────────────────────────
export const agentApi = {
  getDashboard: () => apiRequest("/agent/dashboard"),
  requestPayment: (driverId: string) =>
    apiRequest("/agent/payments/request", { method: "POST", body: JSON.stringify({ driverId }) }),
  verifyPayment: (paymentId: string, otp: string) =>
    apiRequest(`/agent/payments/${paymentId}/verify`, { method: "POST", body: JSON.stringify({ otp }) }),
  getHistory: () => apiRequest("/agent/history"),
  updateFee: (fee: number) =>
    apiRequest("/agent/fee", { method: "PATCH", body: JSON.stringify({ fee }) }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => apiRequest("/admin/dashboard"),
  getDrivers: (search?: string) =>
    apiRequest(`/admin/drivers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getDriver: (id: string) => apiRequest(`/admin/drivers/${id}`),
  createDriver: (data: { name: string; phone: string; password: string; vehiclePlate: string; route: string; accountNumber: string; bankCode: string }) =>
    apiRequest("/admin/drivers", { method: "POST", body: JSON.stringify(data) }),
  updateDriverStatus: (id: string, status: string) =>
    apiRequest(`/admin/drivers/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getAgents: (search?: string) =>
    apiRequest(`/admin/agents${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getAgent: (id: string) => apiRequest(`/admin/agents/${id}`),
  createAgent: (data: { name: string; phone: string; password: string; checkpoint: string; location: string; accountNumber: string; bankCode: string }) =>
    apiRequest("/admin/agents", { method: "POST", body: JSON.stringify(data) }),
  updateAgentStatus: (id: string, status: string) =>
    apiRequest(`/admin/agents/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getTransactions: (params?: { search?: string; type?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.type) q.set("type", params.type);
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return apiRequest(`/admin/transactions${qs ? `?${qs}` : ""}`);
  },
  getLevySettings: () => apiRequest("/admin/levy-settings"),
  createLevySetting: (data: { levyName: string; amount: number; location: string }) =>
    apiRequest("/admin/levy-settings", { method: "POST", body: JSON.stringify(data) }),
  updateLevySetting: (id: string, data: { amount?: number; active?: boolean }) =>
    apiRequest(`/admin/levy-settings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteLevySetting: (id: string) =>
    apiRequest(`/admin/levy-settings/${id}`, { method: "DELETE" }),
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentApi = {
  getBanks: () => apiRequest("/payment/banks"),
  initiateUssdPayment: (data: { routeName: string; passengerPhone: string; passengerBankCode: string; dropPoint?: string }) =>
    apiRequest("/payment/ussd/initiate", { method: "POST", body: JSON.stringify(data) }),
};
