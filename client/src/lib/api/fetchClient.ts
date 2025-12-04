type FetchOptions = RequestInit & {
    skipAuth?: boolean;
};

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: any = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export async function fetchClient(url: string, options: FetchOptions = {}): Promise<Response> {
    const { skipAuth, ...fetchOptions } = options;

    // Ensure credentials are included for cookies
    fetchOptions.credentials = "include";
    fetchOptions.cache = "no-store"; // Prevent browser caching

    // Add JSON headers if body is present and not FormData
    if (fetchOptions.body && !(fetchOptions.body instanceof FormData) && !fetchOptions.headers) {
        fetchOptions.headers = {
            "Content-Type": "application/json",
        };
    }

    try {
        const response = await fetch(url, fetchOptions);

        // Handle 401 Unauthorized
        if (response.status === 401 && !skipAuth) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return fetchClient(url, options);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // Start refreshing
            isRefreshing = true;

            try {
                const refreshResponse = await fetch("/api/refresh", {
                    method: "POST",
                    credentials: "include",
                });

                if (!refreshResponse.ok) {
                    throw new Error("Refresh failed");
                }

                // Refresh successful
                processQueue(null);
                isRefreshing = false;

                // Retry original request
                return fetchClient(url, options);
            } catch (refreshError) {
                // Refresh failed
                processQueue(refreshError as Error);
                isRefreshing = false;

                // Redirect to login or handle logout
                // We can't use hooks here, so we might need to rely on the caller to handle the final 401
                // or redirect directly.
                // if (typeof window !== "undefined") {
                //     window.location.href = "/auth";
                // }
                return Promise.reject(refreshError);
            }
        }

        return response;
    } catch (error) {
        return Promise.reject(error);
    }
}
