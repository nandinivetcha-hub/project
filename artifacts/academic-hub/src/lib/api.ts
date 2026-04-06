import { setAuthTokenGetter } from "@workspace/api-client-react";

export function setupApiAuth() {
  setAuthTokenGetter(() => {
    return localStorage.getItem("auth_token");
  });
}
