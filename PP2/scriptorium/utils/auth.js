import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

// Function to hash a password
export async function hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    try {
        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        throw new Error("Error hashing password");
    }
}

// Function to check if a provided password matches the stored hashed password
export async function checkPassword(password, hashedPassword) {
    try {
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (err) {
        throw new Error("Error checking password");
    }
}

// Function to create JWT token
export function createToken(payload, expiresIn, type) {
    if (type === "ACCESS") {
        return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn }); 
    }
    else if(type === "REFRESH") {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });    
    }
}

// Function to verify JWT token
export function verifyToken(token, type) {
    try {
        if (type === "ACCESS") {
            var secret = process.env.JWT_ACCESS_SECRET;
        }
        else if (type === "REFRESH") {
            var secret = process.env.JWT_REFRESH_SECRET;
        }
        const user = jwt.verify(token, secret);
        return user;
    }
    catch (err) {    
        throw new Error("Error verifying token");
    }

}


// Function to verify the Authorization header (including JWT token) of a HTTP request
export function verifyAuthorizationHeader(token) {
    if (!token?.startsWith("Bearer ")) {
        return null;
    }
    token = token.split(" ")[1];
    try {
        return verifyToken(token, "ACCESS");
    } catch (err) {
        throw new Error("Error verifying token");
    }
}