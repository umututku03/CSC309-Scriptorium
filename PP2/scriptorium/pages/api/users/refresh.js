// pages/api/refresh.js
import { verifyToken, createToken } from '@/utils/auth'

export default function handler(req, res) {
    if (req.method === "POST") { 
        // Verify the refresh token
        try {
            var user = verifyToken(req.body.refreshToken, "REFRESH");
        }
        catch (err) {    
            return res.status(401).json({ error: err });
        }

        const expiresIn = "15m";
        const expiresAt = Math.floor(Date.now() / 1000) + (15 * 60); // Token expiration in Unix timestamp format (15 mins)

        const payload = {
            userId: user.userId,
            role: user.role,
            expiresAt,
        };

        const accessToken = createToken(payload, expiresIn, "ACCESS");

        return res.status(200).json({ accessToken });
    }
    else {
        res.status(405).return({ message: "Method not allowed" });
    }
}
  