import "./globals.css";

export const metadata = {
  title: "Мое приложение",
  description: "Создано в Next.js",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
