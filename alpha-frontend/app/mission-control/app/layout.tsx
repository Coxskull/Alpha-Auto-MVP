import "./globals.css";

import AdminApp from"../components/AdminApp";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AdminApp>
          {children}
        </AdminApp>
      </body>
    </html>
  );
}