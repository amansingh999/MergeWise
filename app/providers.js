"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AppProviders({ children }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        theme="dark"
        newestOnTop
        closeOnClick
        pauseOnHover
        limit={4}
      />
    </>
  );
}
