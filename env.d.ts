declare module "app-env" {
  interface ENV {
    VITE_API_ROOT: string;
    VITE_PATH_PREFIX: string;
    VITE_DISABLE_PASSWORD_RESET: boolean;
  }

  const appEnv: ENV;
  export default appEnv;
}
