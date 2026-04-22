import { auth } from '@/lib/server/auth';
import { SessionProvider } from '@/providers/SessionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
          <ToastContainer position="bottom-right" autoClose={4000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
