import "dotenv/config";
import express from "express";
import connect from "./db/connect.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import cors from "cors";
import cookieParser from "cookie-parser";

// Ensure JWT secret is available before handling auth
if (!process.env.TOKEN_SECRET) {
    if (process.env.NODE_ENV === "production") {
        console.error("FATAL: TOKEN_SECRET must be set in production. Add it to your .env file.");
        process.exit(1);
    }
    process.env.TOKEN_SECRET = "dev-jwt-secret-change-in-production";
    console.warn("TOKEN_SECRET not set; using dev default. Set TOKEN_SECRET in .env for production.");
}

const app = express();

// Middlewares
app.use(express.json({ limit: "30mb" }));
app.use(
    cors({
        origin: ["https://mo-flex-pe7k.vercel.app", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Internal server error",
    });
});

// Default Route
app.get("/", (req, res) => {
    res.status(200).json("Movie App Backend");
});

// Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const start = async () => {
    try {
        await connect(MONGO_URI);
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server is running on PORT ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
};

start();
