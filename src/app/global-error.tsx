"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body className="p-6 text-center">
        <h2 className="text-2xl font-bold">Algo salió mal</h2>
        <pre className="mt-3 text-sm text-red-400">{error.message}</pre>
        <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg">
          Reintentar
        </button>
      </body>
    </html>
  );
}