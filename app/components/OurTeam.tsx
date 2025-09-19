import Image from "next/image";

export default function OurTeam() {
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Sarah Mitchell",
      position: "Founder & CEO",
      specialty: "Educational Leadership",
      image: "/woman2.jpg",
      bio: "With over 15 years in education and child development, Sarah founded PARENTALPAL to bridge the gap between home and school learning. She holds a PhD in Educational Psychology.",
      qualifications: ["PhD Educational Psychology", "Child Development Specialist", "Former Principal"],
      email: "sarah@parentalpal.com",
      linkedin: "https://linkedin.com/in/sarahmitchell"
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Head of Academic Programs",
      specialty: "STEM Education",
      image: "/woman3.jpg",
      bio: "Michael brings 12 years of experience in mathematics and science education. He designs our curriculum and ensures all academic programs meet the highest standards.",
      qualifications: ["Masters in Mathematics Education", "Certified Science Teacher", "Curriculum Designer"],
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Director of Child Development",
      specialty: "Early Childhood Education",
      image: "/woman4.jpg",
      bio: "Emily specializes in early childhood development and creates age-appropriate learning experiences for children aged 2-6. She's passionate about nurturing young minds.",
      qualifications: ["Masters Early Childhood Education", "Montessori Certified", "Play Therapy Training"],
    },
    {
      id: 4,
      name: "David Thompson",
      position: "Operations Manager",
      specialty: "Program Coordination",
      image: "/man1.jpg",
      bio: "David ensures smooth operations across all our programs. With his background in project management, he coordinates tutors, schedules, and maintains our high service standards.",
      qualifications: ["MBA Operations Management", "Project Management Professional", "Quality Assurance Specialist"],
    },
    {
      id: 5,
      name: "Lisa Park",
      position: "Special Education Coordinator",
      specialty: "Inclusive Learning",
      image: "/man2.jpg",
      bio: "Lisa develops specialized programs for children with different learning needs. She ensures every child receives personalized attention and support to reach their full potential.",
      qualifications: ["Masters Special Education", "Autism Spectrum Specialist", "Behavioral Intervention Certified"],
    },
    {
      id: 6,
      name: "James Wilson",
      position: "Technology & Innovation Lead",
      specialty: "EdTech Solutions",
      image: "/woman1.jpg",
      bio: "James integrates technology into our learning programs, developing interactive tools and virtual learning platforms that make education engaging and accessible.",
      qualifications: ["Masters Educational Technology", "Software Development", "UX Design Specialist"],
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our passionate team of educators, child development specialists, and support staff are dedicated to providing exceptional care and education for your children.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Member Photo */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Member Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#90AC19] font-semibold mb-1">
                    {member.position}
                  </p>
                  <p className="text-sm text-gray-600">
                    {member.specialty}
                  </p>
                </div>

                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>

                {/* Qualifications */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Qualifications:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {member.qualifications.map((qual, index) => (
                      <span
                        key={index}
                        className="text-xs bg-[#90AC19]/10 text-[#90AC19] px-2 py-1 rounded-full"
                      >
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>

                
              </div>
            </div>
          ))}
        </div>

        {/* Team Values */}
        <div className="bg-gradient-to-r from-[#90AC19] to-[#7A9216] rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Our Team Values</h3>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              Every team member shares our core commitment to excellence, safety, and nurturing growth in every child we serve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Excellence</h4>
              <p className="opacity-90">
                We maintain the highest standards in education, safety, and service delivery.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Safety First</h4>
              <p className="opacity-90">
                Child safety and wellbeing are our top priorities in everything we do.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Nurturing Care</h4>
              <p className="opacity-90">
                We provide loving, supportive environments where children can thrive and grow.
              </p>
            </div>
          </div>
        </div>

        {/* Join Our Team CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Join Our Amazing Team
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Are you passionate about child development and education? We're always looking for dedicated professionals to join our growing team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#90AC19] hover:bg-[#7A9216] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg">
              View Open Positions
            </button>
            <button className="border-2 border-[#90AC19] text-[#90AC19] hover:bg-[#90AC19] hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
              Submit Your Resume
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}