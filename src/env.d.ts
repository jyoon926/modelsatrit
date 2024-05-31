declare interface Env {
  readonly NODE_ENV: string;
  readonly NG_APP_API_KEY: string;
  readonly NG_APP_AUTH_DOMAIN: string;
  readonly NG_APP_PROJECT_ID: string;
  readonly NG_APP_STORAGE_BUCKET: string;
  readonly NG_APP_MESSAGING_SENDER_ID: string;
  readonly NG_APP_APP_ID: string;
}

declare interface ImportMeta {
  readonly env: Env;
}