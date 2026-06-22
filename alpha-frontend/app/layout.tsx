
export const metadata = {
  title: "Alpha Platform",
  description: "Alpha Auto dispatch, customer, driver, and provider apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
