import axios from "axios"

import { API_URL } from "./api"

const DEFAULT_API_BASE_URL = "http://localhost:8080/admin"

export const adminHttp = axios.create({
  baseURL: API_URL || DEFAULT_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

adminHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message ||
      "Unexpected API error."

    return Promise.reject(new Error(typeof message === "string" ? message : "Unexpected API error."))
  },
)
