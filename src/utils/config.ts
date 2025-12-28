// apiUrl.ts
export const API_URL: string = (() => {
  // 1️⃣ Vite (correct way)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2️⃣ CRA / Webpack
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 3️⃣ Optional runtime override (advanced)
  if ((globalThis as any).__APP_API_URL) {
    return (globalThis as any).__APP_API_URL;
  }

  // 4️⃣ Local fallback
  return 'http://localhost:5000/api';
})();
