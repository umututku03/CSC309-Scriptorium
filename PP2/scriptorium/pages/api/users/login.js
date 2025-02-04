// pages/api/signup.js
import { checkPassword } from '@/utils/auth'
import { createToken } from '@/utils/auth'
import prisma from '@/lib/prisma'

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { email, password } = req.body;
        try {
            // Find user by email
            const user = await prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                return res.status(401).json( { error: "Invalid email or password" });
            }
            // Check password
            const correctPassword = await checkPassword(password, user.password);
            if (!correctPassword) {
                return res.status(401).json( { error: "Invalid email or password" });
            }
            // Generate both the access and refresh tokens
            const expiresInAccessToken = '30m'; // Expires in 30 minutes
            const expiresInRefreshToken = '1d'; // Expires in 1 day
            const expiresAt = Math.floor(Date.now() / 1000) + (30 * 60); // Token expiration in Unix timestamp format (30 mins)

            const payload = {
                userId: user.id,
                role: user.role,
                expiresAt: expiresAt,
            };

            const accessToken = createToken(payload, expiresInAccessToken, "ACCESS");
            const refreshToken = createToken(payload, expiresInRefreshToken, "REFRESH");

            // Return the tokens in the response
            return res.status(200).json({
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        }
        catch (err) {
            return res.status(500).json({ error: err });
        }
    } 
    else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
  