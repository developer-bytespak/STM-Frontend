'use client';

interface RatingFormProps {
  onSubmit: (rating: number, comment: string) => void;
}

export default function RatingForm({ onSubmit }: RatingFormProps) {
  return (
    <div>
      {/* Rating form will be implemented here */}
      <p>Rating form placeholder</p>
    </div>
  );
}