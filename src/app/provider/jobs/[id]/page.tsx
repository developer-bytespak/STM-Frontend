interface JobDetailsProps {
  params: {
    id: string;
  };
}

export default function JobDetails({ params }: JobDetailsProps) {
  return (
    <div>
      <h1>Job Details</h1>
      <p>Job ID: {params.id}</p>
      {/* Job details will be implemented here */}
    </div>
  );
}