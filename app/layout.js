import "./globals.css";
import { Inter } from "next/font/google";
import AppProviders from "./providers";
import Navbar from "../components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "MergeWise — AI Powered Pull Request Intelligence",
  description:
    "Analyze GitHub Pull Requests in seconds. Discover bugs, security risks, and maintainability issues with AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a className="mw-skip" href="#main-content">
          Skip to content
        </a>
        <AppProviders>
          <Navbar />
          <div id="main-content">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
