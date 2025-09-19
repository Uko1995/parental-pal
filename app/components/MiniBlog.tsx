import Image from "next/image";
import Link from "next/link";

export default function MiniBlog() {
  const featuredTutors = [
    {
      id: 1,
      name: "Dr. Sarah Mitchell",
      specialty: "Mathematics & Science",
      rating: 4.9,
      image: "/teacher1.jpg",
      experience: "8 years",
      subjects: ["Algebra", "Chemistry", "Physics"],
    },
    {
      id: 2,
      name: "James Rodriguez",
      specialty: "Language Arts & Literature",
      rating: 4.8,
      image: "/teacher2.jpg",
      experience: "6 years",
      subjects: ["English", "Creative Writing", "Literature"],
    },
    {
      id: 3,
      name: "Emily Chen",
      specialty: "Early Childhood Education",
      rating: 5.0,
      image: "/teacher3.jpg",
      experience: "10 years",
      subjects: ["Reading", "Basic Math", "Social Skills"],
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Summer Science Camp",
      date: "July 15-19, 2024",
      location: "Downtown Learning Center",
      description: "Hands-on experiments and discovery for ages 8-12",
      image: "/camp.jpg",
      spots: "12 spots left",
    },
    {
      id: 2,
      title: "Creative Arts Workshop",
      date: "August 5-9, 2024",
      location: "Community Arts Center",
      description: "Painting, crafts, and creative expression for all ages",
      image: "/workshop.jpg",
      spots: "8 spots left",
    },
    {
      id: 3,
      title: "Math & Logic Challenge",
      date: "August 22-26, 2024",
      location: "Academic Excellence Hub",
      description: "Problem-solving and critical thinking activities",
      image: "/children1.webp",
      spots: "15 spots left",
    },
  ];

  const successStories = [
    {
      id: 1,
      parent: "Maria Lopez",
      child: "Sofia (Age 9)",
      story:
        "Thanks to PARENTALPAL's math tutor, Sofia went from struggling with basic addition to confidently solving multiplication problems in just 3 months!",
      service: "Academic Tutoring",
      achievement: "Grade improvement from C to A",
    },
    {
      id: 2,
      parent: "David Kim",
      child: "Alex & Emma (Ages 6 & 8)",
      story:
        "The summer camp was incredible! My kids learned about robotics, made new friends, and came home excited about science every single day.",
      service: "Holiday Camps",
      achievement: "Discovered passion for STEM",
    },
    {
      id: 3,
      parent: "Rachel Thompson",
      child: "Marcus (Age 7)",
      story:
        "Our homeschooling journey became so much easier with PARENTALPAL's curriculum guidance. Marcus is thriving and loves learning at his own pace.",
      service: "Homeschooling",
      achievement: "Self-directed learning success",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? "text-[#E8931A]" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Updates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with featured tutors, upcoming events, and inspiring
            success stories from our community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Featured Tutors */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-[#90AC19] mr-2">⭐</span>
              Featured Tutors
            </h3>
            <div className="space-y-6">
              {featuredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="bg-[#FFEACF]/40 rounded-xl p-4 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={tutor.image}
                        alt={tutor.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {tutor.name}
                      </h4>
                      <p className="text-sm text-[#90AC19] font-medium mb-2">
                        {tutor.specialty}
                      </p>
                      <div className="flex items-center mb-2">
                        <div className="flex space-x-1 mr-2">
                          {renderStars(tutor.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {tutor.rating} • {tutor.experience}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.slice(0, 2).map((subject, index) => (
                          <span
                            key={index}
                            className="text-xs bg-[#90AC19]/10 text-[#90AC19] px-2 py-1 rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                        {tutor.subjects.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{tutor.subjects.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-[#E8931A] mr-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              Upcoming Events
            </h3>
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-[#FFEACF]/40 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="h-32 relative">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-[#E8931A] text-white text-xs px-2 py-1 rounded-full">
                      {event.spots}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h4>
                    <p className="text-sm text-[#E8931A] font-medium mb-1">
                      {event.date}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {event.location}
                    </p>
                    <p className="text-sm text-gray-700">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-[#A25F97] mr-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              Success Stories
            </h3>
            <div className="space-y-6">
              {successStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-[#FFEACF]/40 rounded-xl p-4 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="mb-3">
                    <span className="inline-block bg-[#A25F97]/10 text-[#A25F97] text-xs font-medium px-3 py-1 rounded-full">
                      {story.service}
                    </span>
                  </div>
                  <blockquote className="text-sm text-gray-700 mb-3 italic">
                    &quot;{story.story}&quot;
                  </blockquote>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {story.parent}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      Parent of {story.child}
                    </p>
                    <p className="text-xs text-[#A25F97] font-medium">
                      ✨ {story.achievement}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Want to read more inspiring stories and stay updated?
          </p>
          <Link href="/blog">
            <button className="bg-[#90AC19] cursor-pointer hover:bg-[#7A9216] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg">
              Visit Our Blog
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
