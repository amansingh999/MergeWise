"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeSync from "../components/theme/ThemeSync";

export default function AppProviders({ children }) {
  return (
    <>
      <ThemeSync />
      {children}
      <ToastContainer
        position="top-right"
        theme="colored"
        newestOnTop
        closeOnClick
        pauseOnHover
        limit={3}
      />
    </>
  );
}
