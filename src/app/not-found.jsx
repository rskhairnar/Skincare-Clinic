import Link from 'next/link';

export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>404 - Not Found</h2>
          <Link href="/">Go Home</Link>
        </div>
      </body>
    </html>
  );
}