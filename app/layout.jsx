import "./globals.css";

export const metadata = {
  title: "LEVEL_UP // OS",
  description: "Cyberpunk Productivity System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
