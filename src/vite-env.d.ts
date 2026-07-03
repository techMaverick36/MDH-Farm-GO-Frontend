/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_PAY_METHOD?: string;
  readonly VITE_PAY_TO?: string;
  readonly VITE_PAY_AMOUNT?: string;
  readonly VITE_PAY_CONTACT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
