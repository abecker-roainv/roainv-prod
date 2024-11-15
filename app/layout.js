// /app/layout.js
import AuthProvider from './auth/Provider'
import ThemeRegistry from './ThemeRegistry'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

export const metadata = {
  title: 'ROA Investment',
  description: 'Sistema de gestión ROA Investment',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  )
}