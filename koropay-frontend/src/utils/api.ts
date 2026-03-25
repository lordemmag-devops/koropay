const API_URL = "http://localhost:5000/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const savedUser = localStorage.getItem("koropay_user");
  const token = savedUser ? JSON.parse(savedUser).token : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }

  return response.status !== 204 ? response.json() : null;
}
