// Safe API URL resolution for multiple build environments (CRA, Vite, generic)
export const API_URL: string = (() => {
  // 1) Try common CRA-style env var (will be inlined at build time)
  try {
    const fromProc = (process as any)?.env?.REACT_APP_API_URL;
    if (fromProc) return fromProc;
  } catch (e) {
    // ignore
  }

  // 2) Try Vite-style import.meta.env
  try {
    // @ts-ignore
    const vite = (import.meta as any)?.VITE_API_URL;
    if (vite) return vite;
  } catch (e) {
    // ignore
  }

  // 3) Try a global override (useful for injecting at runtime)
  try {
    const globalOverride = (globalThis as any)?.__APP_API_URL;
    if (globalOverride) return globalOverride;
  } catch (e) {
    // ignore
  }

  // 4) Fallback to localhost
  return 'http://localhost:5000/api';
})();

export default API_URL;
