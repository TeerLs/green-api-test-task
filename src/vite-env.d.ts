interface ImportMetaEnv {
  readonly VITE_WEB_VITALS_ENDPOINT?: string
  readonly VITE_WEB_VITALS_LOG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
