/**
 * Validates signup request body: username, email, password.
 * Returns { error } with a message if invalid, otherwise { username, email, password }.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_MIN = 2;
const USERNAME_MAX = 50;
const USERNAME_REGEX = /^[a-zA-Z0-9_\-\s]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const PASSWORD_HAS_LETTER = /[a-zA-Z]/;
const PASSWORD_HAS_NUMBER = /\d/;

export function validateSignUp(body) {
    const errors = [];
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username.length) {
        errors.push("Username is required");
    } else if (username.length < USERNAME_MIN) {
        errors.push(`Username must be at least ${USERNAME_MIN} characters`);
    } else if (username.length > USERNAME_MAX) {
        errors.push(`Username must be at most ${USERNAME_MAX} characters`);
    } else if (!USERNAME_REGEX.test(username)) {
        errors.push("Username can only contain letters, numbers, spaces, hyphens, and underscores");
    }

    if (!email.length) {
        errors.push("Email is required");
    } else if (!EMAIL_REGEX.test(email)) {
        errors.push("Please enter a valid email address");
    }
    const emailNormalized = email.toLowerCase();

    if (!password.length) {
        errors.push("Password is required");
    } else if (password.length < PASSWORD_MIN) {
        errors.push(`Password must be at least ${PASSWORD_MIN} characters`);
    } else if (password.length > PASSWORD_MAX) {
        errors.push(`Password must be at most ${PASSWORD_MAX} characters`);
    } else if (!PASSWORD_HAS_LETTER.test(password)) {
        errors.push("Password must include at least one letter");
    } else if (!PASSWORD_HAS_NUMBER.test(password)) {
        errors.push("Password must include at least one number");
    }

    if (errors.length > 0) {
        return { error: errors.join(". ") };
    }
    return { username, email: emailNormalized, password };
}
