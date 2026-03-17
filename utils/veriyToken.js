import jwt from "jsonwebtoken";
import errorHandler from "./errorHandler.js";

const verifyToken = async (req, res, next) => {
    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
        return next(errorHandler(500, "Server misconfiguration: JWT secret not set"));
    }

    const authHeader = req.headers.authorization || req.headers.Authorization;
    const bearerToken =
        typeof authHeader === "string" && authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length).trim()
            : null;

    const cookieToken = req.cookies?.access_token;
    const token = bearerToken || cookieToken;

    const debug = process.env.DEBUG_AUTH === "true";
    if (debug) {
        console.log("[auth] verifyToken", {
            path: req.path,
            method: req.method,
            hasAuthHeader: Boolean(authHeader),
            hasBearerToken: Boolean(bearerToken),
            hasCookieToken: Boolean(cookieToken),
            origin: req.headers.origin,
        });
    }

    if (!token) {
        return next(errorHandler(401, "Unauthorized: missing token"));
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            if (debug) console.error("[auth] jwt.verify error:", err.name, err.message);
            if (err.name === "TokenExpiredError") {
                return next(errorHandler(401, "Unauthorized: token expired"));
            }
            return next(errorHandler(401, "Unauthorized: invalid token"));
        }

        if (debug) console.log("[auth] decoded token:", decoded);
        req.user = decoded;
        next();
    });
}

export default verifyToken;
