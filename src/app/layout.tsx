import { auth } from '@/lib/server/auth';
import { SessionProvider } from '@/providers/SessionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
  title: 'University Grader',
  description: 'Automated lab checking system',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(auth);
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SessionProvider session={session}>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
