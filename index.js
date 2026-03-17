import "dotenv/config";
import express from "express";
import connect from "./db/connect.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import cors from "cors";
import cookieParser from "cookie-parser";

// Verify JWT secret
if (!process.env.TOKEN_SECRET) {
    if (process.env.NODE_ENV === "production") {
        console.error("FATAL: TOKEN_SECRET must be set in production. Add it to your .env file.");
        process.exit(1);
    }
    console.warn("WARN: TOKEN_SECRET not set. Set it in server/.env for local dev and in Vercel env for production.");
}

const app = express();

const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// Middlewares
app.use(express.json({ limit: "30mb" }));
app.use(
    cors({
        origin: (origin, callback) => {
            // allow non-browser tools (no Origin) like curl/postman
            if (!origin) return callback(null, true);
            const allowList = [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                ...FRONTEND_ORIGINS,
                // legacy hardcoded origins (keep to avoid breaking existing deployments)
                "https://mflex-front-bsulv9yap-mohamed-eids-projects-a6eeb72b.vercel.app",
                "https://mflex-front-end.vercel.app",
            ];
            if (allowList.includes(origin)) return callback(null, true);
            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // needed if you keep cookie auth; safe with bearer tokens too
    })
);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Default Route
app.get("/", (req, res) => {
    res.status(200).json("Movie App Backend");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message || err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Internal server error",
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL; // fallback

const start = async () => {
    if (!MONGO_URI) {
        console.error("FATAL: MONGO_URI is not defined in .env or Environment Variables.");
        process.exit(1);
    }

    try {
        await connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on PORT ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err);
        process.exit(1);
    }
};

start();
