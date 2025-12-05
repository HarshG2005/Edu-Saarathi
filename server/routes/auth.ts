import { Router } from "express";
import { storage } from "../storage";
import { hashPassword, comparePasswords, signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } from "../auth";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// POST /api/register
router.post("/register", async (req, res) => {
    try {
        const { email, password, displayName } = registerSchema.parse(req.body);

        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const passwordHash = await hashPassword(password);
        const user = await storage.createUser({
            email,
            passwordHash,
            displayName,
        });

        // Automatically log in after register?
        // For now, just return user info. Client can redirect to login or we can issue token here.
        // Let's issue token for better UX.
        const payload = { sub: user.id, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie("access_token", accessToken, {
            httpOnly: true, // secure against XSS
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.status(201).json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: error.errors });
        }
        res.status(500).json({ message: error.message || "Registration failed" });
    }
});

// POST /api/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.passwordHash))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const payload = { sub: user.id, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        // Set refresh token as httpOnly cookie
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // or 'lax' for local dev if needed
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Set access token as cookie too for simple frontend integration
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: error.errors });
        }
        res.status(500).json({ message: error.message || "Login failed" });
    }
});

// POST /api/guest-login
router.post("/guest-login", async (req, res) => {
    try {
        // Generate random guest credentials
        const randomId = Math.random().toString(36).substring(2, 10);
        const email = `guest_${randomId}@eduquest.ai`;
        const password = Math.random().toString(36).substring(2, 15);
        const displayName = "Guest User";

        const passwordHash = await hashPassword(password);
        const user = await storage.createUser({
            email,
            passwordHash,
            displayName,
        });

        const payload = { sub: user.id, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.status(201).json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        });
    } catch (error: any) {
        console.error("Guest login error:", error);
        res.status(500).json({ message: "Guest login failed", details: error.message });
    }
});

// POST /api/refresh
router.post("/refresh", (req, res) => {
    const refreshToken = req.cookies["refresh_token"];
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        const payload = verifyRefreshToken(refreshToken);
        const newAccessToken = signAccessToken({ sub: payload.sub, email: payload.email });

        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.json({ message: "Token refreshed" });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
});

// POST /api/logout
router.post("/logout", (req, res) => {
    res.clearCookie("refresh_token");
    res.clearCookie("access_token");
    res.json({ message: "Logged out successfully" });
});

// GET /api/user
router.get("/user", async (req, res) => {
    // Check access token from cookie or header
    let token = req.cookies["access_token"];
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const payload = verifyAccessToken(token);
        const user = await storage.getUser(payload.sub);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        res.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

export default router;
