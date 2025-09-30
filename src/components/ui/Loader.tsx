interface LoaderProps {
  className?: string;
}

export default function Loader({ className = '' }: LoaderProps) {
  return (
    <div className={className}>
      {/* Loader will be implemented here */}
      <p>Loading...</p>
    </div>
  );
}