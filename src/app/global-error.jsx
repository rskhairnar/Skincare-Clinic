// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <p style={{ color: '#666', margin: '1rem 0' }}>
            {error.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1rem',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}