import axios from "axios";

const baseURL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({ baseURL });

export function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
