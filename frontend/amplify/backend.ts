import { defineBackend } from "@aws-amplify/backend";
import { proxyFunction } from "./proxyFunction/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  proxyFunction,
});
