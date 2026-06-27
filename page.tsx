import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { SensorLinkProvider } from '@/context/sensorlink-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SensorLink - IoT Monitoring Platform',
  description: 'Professional IoT monitoring platform for ESP32-based sensors with real-time MQTT communication',
  openGraph: {
    title: 'SensorLink - IoT Monitoring Platform',
    description: 'Professional IoT monitoring platform for ESP32-based sensors',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SensorLinkProvider>
            {children}
          </SensorLinkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
