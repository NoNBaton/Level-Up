import "./globals.css";
import RegisterSW from "./register-sw";

export const metadata = {
  title: "LEVEL_UP // OS",
  description: "Cyberpunk Productivity System",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#020817",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
