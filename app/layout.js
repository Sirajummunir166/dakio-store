export const metadata = {
  title: 'Dakio Store — Bangladesh\'s Online Store Platform',
  description: 'Thousands of Bangladeshi stores are powered by Dakio. Find a store or create your own free online store at store.dakio.io.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
