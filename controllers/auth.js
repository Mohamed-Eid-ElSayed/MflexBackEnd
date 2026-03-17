import bcrypt from "bcryptjs";
import argon2 from "argon2";
import User from "../models/user.js";
import errorHandler from "../utils/errorHandler.js";
import { validateSignUp } from "../utils/validateSignUp.js";
import { validateLogin } from "../utils/validateLogin.js";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
/** Argon2 hashes start with $argon2; bcrypt with $2a/$2b - use to detect legacy users */
const isArgon2Hash = (hash) => typeof hash === "string" && hash.startsWith("$argon2");
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
    secure: isProd,
    httpOnly: true,
    // Cross-site cookies (Vercel frontend -> Vercel backend) require SameSite=None;Secure
    sameSite: isProd ? "none" : "lax",
};

const signUp = async (req, res, next) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const validated = validateSignUp(req.body);
    if (validated.error) {
        return next(errorHandler(400, validated.error));
    }

    const { username, email, password } = validated;

    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return next(errorHandler(409, "An account with this email already exists. Please sign in or use a different email."));
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return next(errorHandler(409, "This username is already taken. Please choose another one."));
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: "Account created successfully. You can now sign in." });
    } catch (err) {
        next(err);
    }
};

const logIn = async (req, res, next) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const validated = validateLogin(req.body);
    if (validated.error) {
        return next(errorHandler(400, validated.error));
    }

    const { email, password } = validated;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return next(errorHandler(401, "Invalid email or password"));
        }

        let passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch && isArgon2Hash(user.password)) {
            passwordMatch = await argon2.verify(user.password, password);
        }
        if (!passwordMatch) {
            return next(errorHandler(401, "Invalid email or password"));
        }

        const secret = process.env.TOKEN_SECRET;
        if (!secret) {
            return next(errorHandler(500, "Server misconfiguration: JWT secret not set"));
        }
        const token = jwt.sign({ id: user._id }, secret, { expiresIn: "7d" });
        const { password: _, ...userData } = user._doc;

        res
            .cookie("access_token", token, cookieOptions)
            .status(200)
            .json({ user: userData, token });
    } catch (err) {
        next(err);
    }
};

const logOut = async (req, res, next) => {
    try {
        res.clearCookie("access_token");
        res.status(200).json("Logged out successfully");
    } catch (err) {
        next(err);
    }
};

export {
    signUp,
    logIn,
    logOut
};
