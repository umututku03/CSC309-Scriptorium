// pages/api/ratings/[id].js
import prisma from '@/lib/prisma';
import { verifyAuthorizationHeader } from '@/utils/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  // Authorization check with error handling
  let authUser;
  try {
    authUser = verifyAuthorizationHeader(req.headers.authorization);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized", details: error.message });
  }

  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (req.method === 'PUT') {
      const { votetype } = req.body;

      const rating = await prisma.rating.findUnique({
        where: { id: parseInt(id, 10) }
      });

      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      if (rating.userId !== authUser.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Adjust vote counts based on change in votetype
      if (rating.votetype !== votetype) {
        if (rating.blogPostId) {
          await prisma.blogPost.update({
              where: { id: rating.blogPostId },
              data: {
                  upvotes: rating.votetype === 'UPVOTE' ? { decrement: 1 } : { increment: 1 },
                  downvotes: rating.votetype === 'DOWNVOTE' ? { decrement: 1 } : { increment: 1 }
              }
          });
        } else if (rating.commentId) {
            await prisma.comment.update({
                where: { id: rating.commentId },
                data: {
                    upvotes: rating.votetype === 'UPVOTE' ? { decrement: 1 } : { increment: 1 },
                    downvotes: rating.votetype === 'DOWNVOTE' ? { decrement: 1 } : { increment: 1 },
                }
            });
        }

        // Update the votetype in the rating
        const updatedRating = await prisma.rating.update({
            where: { id: rating.id },
            data: { votetype }
        });

        return res.status(200).json({ message: "Rating updated successfully", updatedRating });
      } else {
        return res.status(200).json({ message: "No changes in votetype", rating });
      }

    } else if (req.method === 'DELETE') {
      const rating = await prisma.rating.findUnique({
        where: { id: parseInt(id, 10) }
      });

      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }

      if (rating.userId !== authUser.userId && authUser.role !== "ADMIN") {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Adjust vote counts based on the votetype being deleted
      if (rating.blogPostId) {
        await prisma.blogPost.update({
          where: { id: rating.blogPostId },
          data: {
            upvotes: rating.votetype === 'UPVOTE' ? { decrement: 1 } : undefined,
            downvotes: rating.votetype === 'DOWNVOTE' ? { decrement: 1 } : undefined,
          }
        });
      } else if (rating.commentId) {
        await prisma.comment.update({
          where: { id: rating.commentId },
          data: {
            upvotes: rating.votetype === 'UPVOTE' ? { decrement: 1 } : undefined,
            downvotes: rating.votetype === 'DOWNVOTE' ? { decrement: 1 } : undefined,
          }
        });
      }

      await prisma.rating.delete({
        where: { id: parseInt(id, 10) }
      });
      return res.status(200).json({ message: "Rating deleted successfully" });

    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
