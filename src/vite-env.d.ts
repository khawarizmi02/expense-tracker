/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_BASE_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_STORAGE_MODE: "localStorage" | "api";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
