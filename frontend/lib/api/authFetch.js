export async function authFetch(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();

        if (!res.ok) {
            const err = new Error(data.message || `Request failed (${res.status})`);
            err.status = res.status;
            throw err;
        }
        return data;
    } 
    catch (error) {
        clearTimeout(timeout);
        if (error.name === "AbortError") {
            throw new Error("Request timed out. Check your connection.");
        }
        throw error;
    }
}