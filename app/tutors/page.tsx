import TutorRegistrationForm from "./TutorRegistrationForm";

export default function TutorsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-white to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Team of Expert Tutors
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Share your knowledge and passion for teaching. Help shape the future
            of learning while building a rewarding career with ParentalPal.
          </p>
        </div>

        {/* Registration Form */}
        <TutorRegistrationForm />
      </div>
    </div>
  );
}
