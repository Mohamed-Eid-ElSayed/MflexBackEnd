/**
 * Validates login request body: email and password required.
 * Returns { error } with message if invalid, otherwise { email, password }.
 * Email is normalized to lowercase for consistent lookup.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(body) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : null;

    if (!email.length) {
        return { error: "Email is required" };
    }
    if (!EMAIL_REGEX.test(email)) {
        return { error: "Please enter a valid email address" };
    }
    if (password === null || password === "") {
        return { error: "Password is required" };
    }

    return { email, password };
}
