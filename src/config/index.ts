import dotenv from "dotenv";
import path from "path";
import { SignOptions } from "jsonwebtoken";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  jwt_access_secret: (process.env.JWT_ACCESS_SECRET || "") as string,
  jwt_refresh_secret: (process.env.JWT_REFRESH_SECRET || "") as string,

  jwt_access_expires_in: process.env
    .JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  jwt_refresh_expires_in: process.env
    .JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  ssl: {
    store_id: process.env.SSL_STORE_ID as string,
    store_passwd: process.env.SSL_STORE_PASSWORD as string,
    is_sandbox: process.env.SSL_IS_SANDBOX === "true",
    success_url: process.env.SSL_SUCCESS_URL as string,
    fail_url: process.env.SSL_FAIL_URL as string,
    cancel_url: process.env.SSL_CANCEL_URL as string,
  },
};
