'use client'

export default function GlobalError({ reset }) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Error</h2>
          <button onClick={() => reset()}>Retry</button>
        </div>
      </body>
    </html>
  );
}