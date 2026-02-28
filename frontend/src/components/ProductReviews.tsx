'use client';

import { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
    _id: string;
    userName: string;
    userEmail?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface ProductReviewsProps {
    productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { data: session } = useSession();

    // Form state
    const [userName, setUserName] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    useEffect(() => {
        if (session?.user?.name && !userName) {
            setUserName(session.user.name);
        }
    }, [session]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${productId}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    userEmail: session?.user?.email,
                    userName,
                    rating,
                    comment
                })
            });

            const data = await res.json();
            if (data.success) {
                setReviews([data.data, ...reviews]);
                setUserName('');
                setRating(5);
                setComment('');
                setHoverRating(0);
            } else {
                alert(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong submitting your review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            const emailParam = session?.user?.email ? `?email=${encodeURIComponent(session.user.email)}` : '';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}${emailParam}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setReviews(reviews.filter(r => r._id !== reviewId));
            } else {
                alert(data.error || 'Failed to delete review');
            }
        } catch (error) {
            console.error('Failed to delete review', error);
            alert('Something went wrong deleting the review');
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : null;

    if (loading) {
        return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-pt-clay border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="mt-20 border-t border-zinc-900 pt-16 max-w-4xl mx-auto px-6 md:px-0">
            <h2 className="text-2xl font-bold mb-10 flex items-center gap-4">
                Customer Reviews
                {averageRating && (
                    <span className="text-base font-normal text-pt-secondary flex items-center gap-1">
                        <Star className="w-4 h-4 text-pt-clay fill-pt-clay" />
                        {averageRating} ({reviews.length})
                    </span>
                )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* Write a Review Form */}
                <div>
                    <h3 className="text-lg font-medium mb-6">Write a Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-pt-secondary mb-2">Rating</label>
                            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star className={`w-6 h-6 transition-colors duration-200 ${(hoverRating || rating) >= star ? 'text-pt-clay fill-pt-clay' : 'text-zinc-700'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-pt-secondary mb-2">Name</label>
                            <input
                                required
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:outline-none focus:border-pt-clay transition-colors"
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-pt-secondary mb-2">Review</label>
                            <textarea
                                required
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:outline-none focus:border-pt-clay transition-colors resize-none"
                                placeholder="What did you like about this product?"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-pt-clay text-black px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>

                {/* Review List */}
                <div className="space-y-8">
                    {reviews.length === 0 ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 p-8 text-center rounded">
                            <Star className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                            <p className="text-pt-secondary">No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="border-b border-zinc-900 pb-6 last:border-0 relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-white">{review.userName}</p>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-pt-clay fill-pt-clay' : 'text-zinc-800'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-pt-secondary">
                                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                        </span>
                                        {session?.user?.email && session.user.email === review.userEmail && (
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Review"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-pt-secondary text-sm leading-relaxed mt-3">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
