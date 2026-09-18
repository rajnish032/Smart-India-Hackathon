import './globals.css';
import { ThemeProvider } from '../components/shared/ThemeProvider';
import ToastProvider from '../components/shared/ToastProvider';

export const metadata = {
  title: 'Quantum Learning Platform',
  description: 'Interactive Quantum Computing Learning Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
