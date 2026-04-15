import { Star, ThumbsUp, CheckCircle, Car } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { reviewApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function ReviewCard({ review }) {
  const { user } = useAuth();
  const [helpful, setHelpful] = useState(review.helpful?.length || 0);
  const [voted, setVoted] = useState(false);

  const handleHelpful = async () => {
    if (!user || voted) return;
    setVoted(true);
    setHelpful(v => v + 1);
    await reviewApi.markHelpful(review._id).catch(() => {
      setVoted(false);
      setHelpful(v => v - 1);
    });
  };

  return (
    <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-red/20 border border-brand-red/30 flex items-center justify-center text-brand-red font-bold text-sm">
            {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-sm dark:text-white text-gray-900">
              {review.user?.firstName} {review.user?.lastName?.[0]}.
            </p>
            <p className="text-xs dark:text-gray-500 text-gray-400">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'dark:text-gray-600 text-gray-300'} />
            ))}
          </div>
          {review.isVerifiedPurchase && (
            <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
              <CheckCircle size={10} /> Verified Purchase
            </span>
          )}
        </div>
      </div>

      {/* Vehicle tag */}
      {review.vehicle?.make && (
        <div className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500 mb-3 dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-full px-3 py-1 w-fit">
          <Car size={11} className="text-brand-red" />
          Installed on {review.vehicle.year} {review.vehicle.make} {review.vehicle.model}
          {review.vehicle.trim && ` ${review.vehicle.trim}`}
        </div>
      )}

      <h4 className="font-heading font-bold text-base dark:text-white text-gray-900 mb-1.5">{review.title}</h4>
      <p className="text-sm dark:text-gray-300 text-gray-600 leading-relaxed mb-4">{review.body}</p>

      {/* Images */}
      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.map((img, i) => (
            <img key={i} src={img.url} alt={img.alt || ''} className="w-20 h-20 object-cover rounded-lg shrink-0" />
          ))}
        </div>
      )}

      {/* Helpful */}
      <div className="flex items-center justify-between border-t dark:border-dark-border border-light-border pt-3">
        <span className="text-xs dark:text-gray-500 text-gray-400">
          {helpful > 0 ? `${helpful} ${helpful === 1 ? 'person' : 'people'} found this helpful` : ''}
        </span>
        <button
          onClick={handleHelpful}
          disabled={!user || voted}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            voted ? 'text-green-400' : 'dark:text-gray-400 text-gray-500 hover:text-brand-red'
          }`}
        >
          <ThumbsUp size={13} />
          Helpful
        </button>
      </div>
    </div>
  );
}
