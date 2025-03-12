import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TodoList App',
  description: '一个简单的待办事项应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
