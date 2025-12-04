import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../auth";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(" ")[1];

    // 2. If no header, check cookies
    if (!token && req.cookies) {
        token = req.cookies["access_token"];
    }

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            email: payload.email,
        };
        next();
    } catch (error) {
        // Optional: Check for refresh token here if access token is expired
        // For now, return 401 and let client handle refresh
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
}
