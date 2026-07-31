import { FaStar } from 'react-icons/fa';

const StarRatingInput = ({ rating, setRating, disabled = false }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && setRating(star)}
          disabled={disabled}
          className="text-yellow-400 hover:text-yellow-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaStar className={star <= rating ? 'fill-current' : 'text-gray-300 hover:text-yellow-400'} />
        </button>
      ))}
    </div>
  );
};

export default StarRatingInput;