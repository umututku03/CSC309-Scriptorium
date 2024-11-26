import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import UserAvatar from "../components/user-avatar";

interface Comment {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
  user: { firstName: string, lastName: string, id: number, avatar: string };
  children: Comment[];
  parentId: number | null;
  report_count: number;
  isHidden: boolean;
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  tag: string;
  upvotes: number;
  downvotes: number;
  templates: { id: number; title: string }[];
  user: { firstName: string; lastName: string, id: number, avatar: string };
  comments: Comment[];
  isHidden: boolean;
}

// Add this interface near the top with other interfaces
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  type: 'post' | 'comment';
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, type }) => {
  const [reportContent, setReportContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reportContent.trim()) {
      alert('Please provide a reason for your report');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reportContent);
      setReportContent('');
      onClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Report {type}</h3>
        <textarea
          value={reportContent}
          onChange={(e) => setReportContent(e.target.value)}
          placeholder="Please describe why you're reporting this content..."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] mb-4"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommentComponentProps {
  comment: Comment;
  onVote: (commentId: number, votetype: string) => Promise<void>;
  onReport: (commentId: number) => void;
  onReply: (commentId: number) => void;
  onCancelReply: () => void;
  onPostReply: (parentId: number) => Promise<void>;
  replyingTo: number | null;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  expandedComments: Set<number>;
  onToggleReplies: (commentId: number) => void;
  onToggleHide: (commentId: number, currentHiddenState: boolean) => Promise<void>;
  isAdmin: boolean;
  currentUserId: number | null;
}

const CommentComponent: React.FC<CommentComponentProps> = ({
  comment,
  onVote,
  onReport,
  onReply,
  onCancelReply,
  onPostReply,
  replyingTo,
  replyContent,
  onReplyContentChange,
  expandedComments,
  onToggleReplies,
  onToggleHide,
  isAdmin,
  currentUserId,
}) => {
  const isAuthor = currentUserId === comment.user.id;
  const shouldShow = !comment.isHidden || isAdmin || isAuthor;
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {/* User Info */}
      <div className="flex text-gray-500 items-center mb-2">
        <UserAvatar user={comment.user} />
        <div className="ml-2">
          <p className="font-medium">
            {comment.user.firstName} {comment.user.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {isAdmin && comment.report_count > 0 && (
            <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
              🚩 {comment.report_count} report{comment.report_count !== 1 ? 's' : ''}
            </span>
          )}
          {comment.isHidden && (isAdmin || isAuthor) && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              🚫 Hidden
            </span>
          )}
        </div>
      </div>
      
      {/* Comment Content */}
      <p className="text-gray-700 ml-10 mb-3">{comment.content}</p>
      
      {/* Comment Actions */}
      <div className="ml-10 space-x-3 mb-3">

        {isAdmin && (
          <button
            onClick={() => onToggleHide(comment.id, comment.isHidden)}
            className={`inline-flex items-center px-2 py-1 rounded transition-colors text-sm
              ${comment.isHidden 
                ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
          >
            {comment.isHidden ? '👁️ Unhide' : '🚫 Hide'}
          </button>
        )}
        <button
          onClick={() => onVote(comment.id, "UPVOTE")}
          className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm"
        >
          👍 {comment.upvotes}
        </button>
        <button
          onClick={() => onVote(comment.id, "DOWNVOTE")}
          className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm"
        >
          👎 {comment.downvotes}
        </button>
        <button
          onClick={() => onReport(comment.id)}
          className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition-colors text-sm"
        >
          🚩 Report
        </button>
        <button
          onClick={() => onReply(comment.id)}
          className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
        >
          ↩️ Reply
        </button>
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ml-10 mt-3">
          <textarea
            value={replyContent}
            onChange={(e) => onReplyContentChange(e.target.value)}
            placeholder="Write your reply..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            rows={3}
          />
          <div className="mt-2 space-x-2">
            <button
              onClick={() => onPostReply(comment.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Post Reply
            </button>
            <button
              onClick={onCancelReply}
              className="px-3 py-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.children.length > 0 && shouldShow && (
        <div className="ml-10">
          <button
            onClick={() => onToggleReplies(comment.id)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {expandedComments.has(comment.id) ? "▼" : "▶"} {comment.children.length} { comment.children.length > 1 ? "Replies" : "Reply" }
          </button>
          
          {expandedComments.has(comment.id) && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
              {comment.children.map((reply) => (
                <CommentComponent
                  key={reply.id}
                  comment={reply}
                  onVote={onVote}
                  onReport={onReport}
                  onReply={onReply}
                  onCancelReply={onCancelReply}
                  onPostReply={onPostReply}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  onReplyContentChange={onReplyContentChange}
                  expandedComments={expandedComments}
                  onToggleReplies={onToggleReplies}
                  onToggleHide={onToggleHide}
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



const BlogPostDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [newComment, setNewComment] = useState<string>(""); // For adding new comments
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set()); // Track expanded comments
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);

  const handleReport = async (content: string) => {
    if (!blogPost) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You need to log in to report content.");
        return;
      }
      console.log(content);

      await axios.post(
        `/api/reports`,
        { 
          blogPostId: blogPost.id, 
          content: content 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Thank you for your report. We will review it shortly.");
    } catch (err: any) {
      if (err.status === 409) {
        alert("You have already reported this post");
      }
      console.error("Failed to report the post:", err.response?.data?.error || err.message);
      throw err;
    }
  };

  const handleCommentReport = async (commentId: number, content: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You need to log in to report content");
        return;
      }

      await axios.post(
        `/api/reports`,
        { commentId, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Thank you for your report. We will review it shortly.");
    } catch (err: any) {
      if (err.status === 409) {
        alert("You have already reported this comment");
      }
      console.error("Failed to report the comment:", err.response?.data?.error || err.message);
      throw err;
    }
  };

  // Modify the CommentComponent props to include new reporting function
  const handleCommentReportClick = (commentId: number) => {
    setReportingCommentId(commentId);
    setShowReportModal(true);
  };


  const processComments = (blogPostData: BlogPost) => {
    // Organize comments into a hierarchical structure
    const commentsById: { [key: number]: Comment } = {};
    console.log(blogPostData.comments);
    blogPostData.comments.forEach((comment: Comment) => {
      commentsById[comment.id] = { ...comment, children: [] };
    });

    // Associate replies with their parents
    blogPostData.comments.forEach((comment: Comment) => {
      if (comment.parentId) {
        commentsById[comment.parentId].children.push(commentsById[comment.id]);
      }
    });

    // Extract top-level comments
    blogPostData.comments = blogPostData.comments.map((comment: Comment) => commentsById[comment.id]);
    console.log(blogPostData.comments)
  }

  const fetchBlogPost = async () => {
    let accessToken = localStorage.getItem("accessToken"); // Or wherever you store the token
    let refreshToken = localStorage.getItem("refreshToken");
    try {
      setLoading(true);
      if (accessToken) {
        var response = await axios.get(`/api/blogposts/${id}`, 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              sortOrder,
              sortBy
            }
          }
        );
        var currentUser = await axios.get(`/api/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCurrentUserId(currentUser.data.id);
        setIsAdmin(currentUser.data.role === 'ADMIN');
      }
      else {
        var response = await axios.get(`/api/blogposts/${id}`, {
          params: {
            sortOrder
          }
        })
      }
      let blogPostData = response.data.blogPost;
      console.log(response.data.blogPost);
      processComments(blogPostData)
      setBlogPost(blogPostData);
    } catch (err: any) {
      if (err.status === 401) {
        if (refreshToken) {
          try {
            response = await axios.post('/api/users/refresh', { refreshToken });
            accessToken = response.data.accessToken;
            if (accessToken) {
              localStorage.setItem("accessToken", accessToken);
              response = await axios.get(`/api/blogposts/${id}`, 
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                  params: {
                    sortOrder,
                    sortBy
                  }
                }
              );
              let blogPostData = response.data.blogPost;
              processComments(blogPostData)
              setBlogPost(blogPostData);

              currentUser = await axios.get(`/api/users/me`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              setCurrentUserId(currentUser.data.id);
              setIsAdmin(currentUser.data.role === 'ADMIN');
            }
          }
          catch (err: any) {
            try {
              response = await axios.get(`/api/blogposts/${id}`, {
                params: {
                  sortOrder,
                  sortBy
                }
              });
              let blogPostData = response.data.blogPost;
              processComments(blogPostData)
              setBlogPost(blogPostData);
            } 
            catch (err: any) {
              setError("Failed to load the blog post. Please try again later.");
            }
          }
        }
      }
      else {
        setError("Failed to load the blog post. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (votetype: string) => {
    if (!blogPost) return;
    try {
      const token = localStorage.getItem("accessToken"); // Or wherever you store the token
      if (!token) {
        alert("You need to log in to vote.");
        return;
      }

      const res = await axios.post(
        `/api/ratings`,
        { votetype, blogPostId: blogPost.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Updated existing rating
      if (res.status === 200) {
        const newBlogPost = { 
          ...blogPost, 
          upvotes: votetype === "UPVOTE" ? blogPost.upvotes + 1 : blogPost.upvotes - 1,
          downvotes: votetype === "DOWNVOTE" ? blogPost.downvotes + 1 : blogPost.downvotes - 1,
        }
        setBlogPost(newBlogPost);
      } 

      // Created new rating
      if (res.status === 202) {
        const newBlogPost = { 
          ...blogPost, 
          upvotes: votetype === "UPVOTE" ? blogPost.upvotes + 1 : blogPost.upvotes,
          downvotes: votetype === "DOWNVOTE" ? blogPost.downvotes + 1 : blogPost.downvotes,
        }
        setBlogPost(newBlogPost);
      }
    } catch (err: any) {
      console.error("Failed to rate the post:", err.response?.data?.error || err.message);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
  
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You need to log in to comment.");
        return;
      }
  
      const response = await axios.post(
        `/api/comments`,
        { blogPostId: blogPost?.id, content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Add the new comment to the state
      if (blogPost) {
        const newCommentData = response.data.newComment;
        console.log(newCommentData);
        const updatedBlogPost = {
          ...blogPost,
          comments: [...blogPost.comments, newCommentData]
        };
        processComments(updatedBlogPost);
        console.log(updatedBlogPost);
        setBlogPost(updatedBlogPost);
      }
      
      setNewComment(""); // Clear the input field
    }
    catch (err: any) {
      console.error("Failed to post comment:", err.response?.data?.error || err.message);
    }
  };
  
  const postReply = async (parentId: number) => {
    if (!replyContent.trim()) {
      alert("Reply cannot be empty.");
      return;
    }
  
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You need to log in to comment.");
        return;
      }
  
      const response = await axios.post(
        `/api/comments`,
        { 
          blogPostId: blogPost?.id, 
          content: replyContent,
          parentId 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Add the new reply to the state
      if (blogPost) {
        const newReply = response.data.newComment;
        const updatedBlogPost = {
          ...blogPost,
          comments: [...blogPost.comments, newReply]
        };
        processComments(updatedBlogPost);
        setBlogPost(updatedBlogPost);
      }
  
      // Reset states
      setReplyingTo(null);
      setReplyContent("");
    }
    catch (err: any) {
      console.error("Failed to post reply:", err.response?.data?.error || err.message);
    }
  };

  const toggleReplies = (commentId: number) => {
    console.log(commentId)
    console.log(blogPost?.comments);
    setExpandedComments((prev) => {
      const updated = new Set(prev);
      if (updated.has(commentId)) {
        updated.delete(commentId);
      } else {
        updated.add(commentId);
      }
      return updated;
    });
  };

  const parseContent = (content: string) => {
    const parts = content.split(/(#\d+)/g); // Split content by `#id`
    return parts.map((part, index) => {
      if (part.match(/#\d+/)) {
        const templateId = part.slice(1); // Extract the ID from `#id`
        return (
          <Link key={index} href={`/codetemplates/${templateId}`} passHref>
            <span className="text-blue-500 hover:underline cursor-pointer">
              {part}
            </span>
          </Link>
        );
      }
      return part; // Return plain text for non-`#id` parts
    });
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this blog post?");
    if (!confirmDelete) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(`/api/blogposts/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      alert("Blog post deleted successfully!");
      router.push("/blogposts"); // Redirect to blog post list
    } catch (err: any) {
      console.error("Failed to delete the blog post:", err.response?.data?.error || err.message);
      alert("Failed to delete the blog post. Please try again.");
    }
  };

  const handleCommentVote = async (commentId: number, votetype: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You need to log in to vote");
        return;
      }
  
      const res = await axios.post(
        `/api/ratings`,
        { votetype, commentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (res.status === 200 || res.status === 202) {
        setBlogPost((prevBlogPost) => {
          if (!prevBlogPost) return null;
  
          // Helper function to update comment in nested structure
          const updateCommentVotes = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                if (res.status === 200) {
                  return {
                    ...comment,
                    upvotes: votetype === "UPVOTE" ? comment.upvotes + 1 : comment.upvotes - 1,
                    downvotes: votetype === "DOWNVOTE" ? comment.downvotes + 1 : comment.downvotes - 1,
                  };
                }
                else {
                  return {
                    ...comment,
                    upvotes: votetype === "UPVOTE" ? comment.upvotes + 1 : comment.upvotes,
                    downvotes: votetype === "DOWNVOTE" ? comment.downvotes + 1 : comment.downvotes,
                  };
                }
              }
              return {
                ...comment,
                children: updateCommentVotes(comment.children),
              };
            });
          };
  
          return {
            ...prevBlogPost,
            comments: updateCommentVotes(prevBlogPost.comments),
          };
        });
      }
    } catch (err: any) {
      console.error("Failed to rate the comment:", err.response?.data?.error || err.message);
    }
  };

  const handleCommentToggleHide = async (commentId: number, currentHiddenState: boolean) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You need to be logged in");
        return;
      }
  
      const response = await axios.put(
        `/api/comments/${commentId}`,
        { isHidden: !currentHiddenState },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response)
  
      setBlogPost((prevBlogPost) => {
        if (!prevBlogPost) return null;
  
        const updateCommentVisibility = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isHidden: !currentHiddenState
              };
            }
            return {
              ...comment,
              children: updateCommentVisibility(comment.children)
            };
          });
        };
  
        return {
          ...prevBlogPost,
          comments: updateCommentVisibility(prevBlogPost.comments)
        };
      });
    } catch (err: any) {
      console.error("Failed to update comment visibility:", err.response?.data?.error || err.message);
      alert("Failed to update comment visibility. Please try again.");
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id, sortOrder, sortBy]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="text-red-500 flex items-center justify-center">
        <span className="mr-2">⚠️</span>
        {error}
      </div>
    </div>
  );
  
  if (!blogPost) return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="text-gray-500 flex items-center justify-center">
        No blog post found.
      </div>
    </div>
  );

  const isOwner = blogPost.user.id === currentUserId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Main Blog Post Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl text-black font-bold mb-2">{blogPost.title}</h1>
              <div className="text-sm text-gray-500 space-y-2">
              <div className="flex items-center">
                <UserAvatar user={blogPost.user} />
                <span className="ml-2">
                  {blogPost.user.firstName} {blogPost.user.lastName}
                </span>
              </div>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {blogPost.tag}
                </span>
              </div>
            </div>
            
            {isOwner && !blogPost.isHidden && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => router.push(`/blogposts/edit/${id}`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6 text-black">
            {parseContent(blogPost.content)}
          </div>

          {/* Linked Templates */}
          {blogPost.templates.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg text-black font-semibold mb-2">Linked Templates</h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.templates.map((template) => (
                  <Link 
                    key={template.id} 
                    href={`/templates/${template.id}`}
                    className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors"
                  >
                    {template.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <ReportModal
              isOpen={showReportModal}
              onClose={() => {
                setShowReportModal(false);
                setReportingCommentId(null);
              }}
              onSubmit={async (content) => {
                if (reportingCommentId) {
                  await handleCommentReport(reportingCommentId, content);
                } else {
                  await handleReport(content);
                }
              }}
              type={reportingCommentId ? 'comment' : 'post'}
            />

          {/* Interaction Buttons */}
          <div className="flex items-center space-x-4 mt-6 pt-6 border-t">
            <button
              onClick={() => handleVote("UPVOTE")}
              className="inline-flex items-center px-4 py-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              👍 {blogPost.upvotes}
            </button>
            <button
              onClick={() => handleVote("DOWNVOTE")}
              className="inline-flex items-center px-4 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              👎 {blogPost.downvotes}
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
            >
              🚩 Report
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl text-black font-bold mb-6">Comments</h2>

        <div className="flex items-center">
        {isAdmin && (
            <div className="flex items-center">
              <label htmlFor="sortBy" className="mr-2 text-gray-600">
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "rating" | "reports")}
                className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">Rating</option>
                <option value="reports">Report Count</option>
              </select>
            </div>
          )}
            <label htmlFor="sortOrder" className="mr-2 text-gray-600">
              Sort by:
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">
                {sortBy === "reports" ? "Most reported first" : "Highest rating"}
              </option>
              <option value="asc">
                {sortBy === "reports" ? "Least reported first" : "Lowest rating"}
              </option>
            </select>
          </div>
        
        {/* New Comment Form */}
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
          />
          <button
            onClick={postComment}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Post Comment
          </button>
        </div>

        <div className="border-t pt-6">
          {blogPost.comments.length > 0 ? (
            <div className="space-y-6">
              {blogPost.comments.filter(comment => comment.parentId === null).map((comment) => (
                <CommentComponent
                key={comment.id}
                comment={comment}
                onVote={handleCommentVote}
                onReport={handleCommentReportClick}
                onToggleHide={handleCommentToggleHide} // Add this
                onReply={setReplyingTo}
                onCancelReply={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
                onPostReply={postReply}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onReplyContentChange={(content) => setReplyContent(content)}
                expandedComments={expandedComments}
                onToggleReplies={toggleReplies}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
              />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default BlogPostDetail;
