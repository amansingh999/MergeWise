import axios from "axios";
import { ANALYZE_PR_ENDPOINT } from "../constants/api";

const client = axios.create({
  timeout: 180000,
  headers: { "Content-Type": "application/json" },
});

export async function analyzePullRequest(prUrl) {
  const { data } = await client.post(ANALYZE_PR_ENDPOINT, { prUrl });
  return data;
}

export function getAxiosErrorMessage(error) {
  if (!error) return "Unknown error";
  if (error.response?.data) {
    const d = error.response.data;
    if (typeof d === "string") return d;
    if (d.message) return String(d.message);
    if (d.error) return String(d.error);
    try {
      return JSON.stringify(d);
    } catch {
      return error.message || "Request failed";
    }
  }
  if (error.message) return error.message;
  return "Network error";
}
