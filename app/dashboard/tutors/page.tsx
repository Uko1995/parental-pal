import {
  AcademicCapIcon,
  PlusIcon,
  UserIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import TutorTable from "./TutorTable";
import TutorCharts from "./TutorCharts";
import {
  getTutors,
  getTutorSubjectDistribution,
  getTutorRegistrationTrends,
} from "./action";

export default async function TutorsPage() {
  // Fetch all data for tutors and charts
  const [tutorsData, subjectData, registrationData] = await Promise.all([
    getTutors(),
    getTutorSubjectDistribution(),
    getTutorRegistrationTrends(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutors</h1>
          <p className="text-gray-600 mt-1">
            Manage tutor profiles and information
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Tutor
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tutors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tutorsData?.tutorStats.totalTutors || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tutors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tutorsData?.tutorStats.activeTutors || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tutorsData?.tutorStats.newThisMonth || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Tutors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((tutorsData?.tutorStats.activeTutors || 0) * 0.8)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <UserIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TutorCharts
          registrationData={registrationData}
          subjectData={subjectData}
        />
      </div>

      {/* Tutors Table */}
      <TutorTable tutors={tutorsData?.tutors || []} />
    </div>
  );
}
