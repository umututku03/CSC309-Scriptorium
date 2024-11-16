import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, createToken } from '@/utils/auth';

interface UserPayload {
    userId: number;
    role: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        let user: UserPayload;
        
        try {
            user = verifyToken(req.body.refreshToken, "REFRESH") as UserPayload;
        } catch (err) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        const expiresIn = "60m";
        const expiresAt = Math.floor(Date.now() / 1000) + (15 * 60); // Token expiration in Unix timestamp format (15 mins)

        const payload = {
            userId: user.userId,
            role: user.role,
            expiresAt,
        };

        const accessToken = createToken(payload, expiresIn, "ACCESS");

        return res.status(200).json({ accessToken });
    } else {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ message: "Method not allowed" });
    }
}