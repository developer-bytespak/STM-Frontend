interface BookingDetailsProps {
  params: {
    id: string;
  };
}

export default function BookingDetails({ params }: BookingDetailsProps) {
  return (
    <div>
      <h1>Booking Details</h1>
      <p>Booking ID: {params.id}</p>
      {/* Booking details will be implemented here */}
    </div>
  );
}