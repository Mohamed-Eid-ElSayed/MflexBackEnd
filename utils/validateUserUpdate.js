/**
 * Validates and sanitizes user update fields.
 * Returns { error } if validation fails, otherwise { username, email, password, avatar } with only valid present fields.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_MIN_LENGTH = 1;
const USERNAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

function isValidBase64Image(value) {
    if (typeof value !== "string") return false;
    return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(value) || value.startsWith("https://");
}

export function validateUserUpdate(body) {
    const errors = [];
    const result = {};

    const username = typeof body.username === "string" ? body.username.trim() : undefined;
    const email = typeof body.email === "string" ? body.email.trim() : undefined;
    const password = typeof body.password === "string" ? body.password : undefined;
    const avatar = body.avatar;

    if (username !== undefined) {
        if (username.length < USERNAME_MIN_LENGTH) {
            errors.push("Username cannot be empty");
        } else if (username.length > USERNAME_MAX_LENGTH) {
            errors.push("Username is too long");
        } else {
            result.username = username;
        }
    }

    if (email !== undefined) {
        if (!email.length) {
            errors.push("Email cannot be empty");
        } else if (!EMAIL_REGEX.test(email)) {
            errors.push("Invalid email format");
        } else {
            result.email = email;
        }
    }

    if (password !== undefined && password !== "") {
        if (password.length < PASSWORD_MIN_LENGTH) {
            errors.push("Password must be at least 8 characters long");
        } else if (!PASSWORD_REGEX.test(password)) {
            errors.push("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)");
        } else {
            result.password = password;
        }
    }

    if (avatar !== undefined && avatar !== null && avatar !== "") {
        if (!isValidBase64Image(avatar)) {
            errors.push("Profile picture must be a valid image (JPEG, PNG, GIF, or WebP)");
        } else {
            result.avatar = avatar;
        }
    }

    if (errors.length > 0) {
        return { error: errors.join(". ") };
    }
    return result;
}
