import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Environment variable type safety
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';

// Interface for the payload
interface Payload {
    userId: number;
    role: string;
    expiresAt?: number;
}

// Function to hash a password
export async function hashPassword(password: string): Promise<string> {
    try {
        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        return hashedPassword;
    } catch (err) {
        throw new Error("Error hashing password");
    }
}

// Function to check if a provided password matches the stored hashed password
export async function checkPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (err) {
        throw new Error("Error checking password");
    }
}

// Function to create JWT token
export function createToken(payload: Payload, expiresIn: string, type: "ACCESS" | "REFRESH"): string {
    const secret = type === "ACCESS" ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET;
    return jwt.sign(payload, secret, { expiresIn });
}

// Function to verify JWT token
export function verifyToken(token: string, type: "ACCESS" | "REFRESH"): Payload {
    const secret = type === "ACCESS" ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET;
    try {
        return jwt.verify(token, secret) as Payload;
    } catch (err) {
        throw new Error("Error verifying token:");
    }
}

// Function to verify the Authorization header (including JWT token) of a HTTP request
export function verifyAuthorizationHeader(header: string): Payload | null {
    if (!header.startsWith("Bearer ")) {
        return null;
    }
    const token = header.split(" ")[1];
    try {
        return verifyToken(token, "ACCESS");
    } catch (err) {
        throw new Error("Error verifying token");
    }
}