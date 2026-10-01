declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: "development" | "test" | "production";
      DB_DRIVER: "mysql" | "mariadb" | "postgresql" | "sqlite";
      DB_NAME: string;
      DB_USER: string;
      DB_HOST: string;
      DB_PASSWORD: string;
      DB_PORT: number;
      SECRET_JWT_KEY: string;
    }
  }
}

export { };