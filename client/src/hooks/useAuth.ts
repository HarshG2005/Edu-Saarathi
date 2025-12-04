import { fetchClient } from "../lib/api/fetchClient";

// Note: Access token is stored in httpOnly cookie by the backend, 
// so we cannot access it directly in JavaScript.
// This hook provides helper methods for auth actions.

export function useAuthHelper() {
    const login = async (email: string, password: string) => {
        const res = await fetchClient("/api/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            skipAuth: true, // Don't try to refresh if login fails
        });

        if (!res.ok) {
            throw new Error("Login failed");
        }

        return res.json();
    };

    const logout = async () => {
        await fetchClient("/api/logout", {
            method: "POST",
            skipAuth: true,
        });
        // Redirect is handled by the caller or global state
        if (typeof window !== "undefined") {
            window.location.href = "/auth";
        }
    };

    // This will always return null because tokens are httpOnly cookies
    const getAccessToken = () => {
        console.warn("getAccessToken: Tokens are stored in httpOnly cookies and cannot be accessed via JS.");
        return null;
    };

    return {
        login,
        logout,
        getAccessToken,
    };
}
