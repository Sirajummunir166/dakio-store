export const metadata = { title: 'Dakio Store', description: 'Powered by Dakio' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
