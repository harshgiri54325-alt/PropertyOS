import "./globals.css";

export const metadata = {
  title: "PropertyOS",
  description: "Real Estate Operating System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
