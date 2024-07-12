import { defineFunction, secret } from "@aws-amplify/backend";

export const proxyFunction = defineFunction({
  environment: {
    GENERATE_SIGNED_S3_URL_API_ENDPOINT: secret(
      "GENERATE_SIGNED_S3_URL_API_ENDPOINT"
    ),
    MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT: secret(
      "MANAGE_USER_SUBMISSIONS_TABLE_API_ENDPOINT"
    ),
    API_KEY: secret("API_KEY"),
  },
  name: "proxy-function",
  entry: "./handler.ts",
});
