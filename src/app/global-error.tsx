+ 'use client'
+
+ export default function GlobalError({
+   error,
+   reset
+ }: {
+   error: Error & { digest?: string }
+   reset: () => void
+ }) {
+   return (
+     <html>
+       <body className="p-4">
+         <h2 className="text-lg font-semibold">Algo ha fallado</h2>
+         <p className="text-sm text-gray-500 mt-2">{error.message}</p>
+         <button
+           onClick={() => reset()}
+           className="mt-4 rounded-xl bg-[#7B1DF7] text-white px-4 py-2 text-sm"
+         >
+           Reintentar
+         </button>
+       </body>
+     </html>
+   )
+ }
