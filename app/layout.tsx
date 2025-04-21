import "./globals.css";

export const metadata = {
  title: "Engagement Map",
  description: "Interactive map of survey responses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          padding: 0,
          margin: 0,
          height: "100vh",
          width: "100vw",
        }}
      >
        {children}
      </body>
    </html>
  );
}
