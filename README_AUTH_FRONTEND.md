# Frontend Authentication & Automatic Refresh

This document explains the frontend authentication implementation, specifically the automatic token refresh flow.

## 🚀 How It Works

The application uses a custom `fetchClient` wrapper around the native `fetch` API. This wrapper handles:

1.  **Automatic Credential Inclusion**: Always sends `credentials: "include"` to ensure `httpOnly` cookies (access_token, refresh_token) are sent with requests.
2.  **401 Interception**: If a request returns `401 Unauthorized`, the client intercepts it.
3.  **Automatic Refresh**: It attempts to call `POST /api/refresh` to get a new access token (set automatically as a cookie by the backend).
4.  **Retry**: If refresh succeeds, it retries the original request.
5.  **Concurrency Management**: If multiple requests fail simultaneously, only **one** refresh request is sent. Other requests wait in a queue and are retried once the refresh completes.
6.  **Logout**: If refresh fails, the user is redirected to `/auth`.

## 📂 Key Files

*   `client/src/lib/api/fetchClient.ts`: The core logic for the fetch wrapper and refresh queue.
*   `client/src/lib/queryClient.ts`: Integrated with TanStack Query to ensure all data fetching uses `fetchClient`.
*   `client/src/hooks/useAuth.ts`: Helper hook for manual login/logout actions.

## 🛠️ Usage

### Making API Calls

You don't need to do anything special! Just use `apiRequest` or `useQuery` as usual. They are already patched to use `fetchClient`.

```typescript
// Example using React Query
const { data } = useQuery({
  queryKey: ["/api/documents"],
});

// Example using apiRequest directly
await apiRequest("POST", "/api/documents", { name: "New Doc" });
```

### Manual Login/Logout

```typescript
import { useAuthHelper } from "@/hooks/useAuth";

const { login, logout } = useAuthHelper();

// Login
await login("user@example.com", "password");

// Logout
await logout();
```

## 🧪 Testing the Refresh Flow

You can verify the refresh flow using `curl`.

1.  **Login** to get cookies:
    ```bash
    # Save cookies to a jar file
    curl -c cookies.txt -X POST http://localhost:5000/api/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"test@example.com\", \"password\":\"password123\"}"
    ```

2.  **Wait** for the access token to expire (default 15m). Or, manually delete the `access_token` from `cookies.txt` but keep `refresh_token`.

3.  **Attempt a protected request** (simulating expired access token):
    ```bash
    # The frontend would receive 401 here
    curl -b cookies.txt http://localhost:5000/api/user
    ```

4.  **Call Refresh** (simulating frontend interceptor):
    ```bash
    # This uses the refresh_token to get a new access_token
    curl -b cookies.txt -c cookies.txt -X POST http://localhost:5000/api/refresh
    ```

5.  **Retry protected request**:
    ```bash
    curl -b cookies.txt http://localhost:5000/api/user
    ```

## ⚠️ Important Note on Tokens

The backend uses **httpOnly cookies** for security. This means:
*   JavaScript **cannot** read the access token.
*   We do **not** use `Authorization: Bearer` headers.
*   The browser handles token storage and transmission automatically.

This is more secure than storing tokens in `localStorage` as it prevents XSS attacks from stealing tokens.
