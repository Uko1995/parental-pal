"use client";

import { useState, useEffect } from "react";
import {
  AcademicCapIcon,
  PlusIcon,
  UserIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import TutorTable from "./TutorTable";
import TutorCharts from "./TutorCharts";
import AddTutorModal from "./AddTutorModal";

interface TutorStats {
  totalTutors: number;
  activeTutors: number;
  newThisMonth: number;
  verifiedTutors: number;
}

interface TutorsData {
  tutors: Array<Record<string, unknown>>;
  tutorStats: TutorStats;
}

interface SubjectData {
  subject: string;
  count: number;
}

interface RegistrationData {
  month: string;
  registrations: number;
}

export default function TutorsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tutorsData, setTutorsData] = useState<TutorsData>({
    tutors: [],
    tutorStats: {
      totalTutors: 0,
      activeTutors: 0,
      newThisMonth: 0,
      verifiedTutors: 0,
    },
  });
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tutorsResponse, subjectsResponse, registrationsResponse] =
        await Promise.all([
          fetch("/api/tutors-data"),
          fetch("/api/tutors-data?type=subjects"),
          fetch("/api/tutors-data?type=registration-trends"),
        ]);

      if (
        tutorsResponse.ok &&
        subjectsResponse.ok &&
        registrationsResponse.ok
      ) {
        const tutorsData = await tutorsResponse.json();
        const subjectsData = await subjectsResponse.json();
        const registrationsData = await registrationsResponse.json();

        setTutorsData(tutorsData as unknown as TutorsData);
        setSubjectData(subjectsData);
        setRegistrationData(registrationsData);
      }
    } catch (error) {
      console.error("Error fetching tutors data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTutorAdded = () => {
    fetchData(); // Refresh the data
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Tutors</h1>
          <p className="text-gray-600 mt-1">
            Manage tutor profiles and information
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
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
                  {tutorsData.tutorStats.totalTutors}
                </p>
              </div>
              <div className="p-3 rounded-full">
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
                  {tutorsData.tutorStats.activeTutors}
                </p>
              </div>
              <div className="p-3  rounded-full">
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
                  {tutorsData.tutorStats.newThisMonth}
                </p>
              </div>
              <div className="p-3  rounded-full">
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
                  {Math.floor(tutorsData.tutorStats.activeTutors * 0.8)}
                </p>
              </div>
              <div className="p-3  rounded-full">
                <UserIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TutorCharts
          registrationData={
            registrationData as unknown as Array<{
              month: string;
              registrations: number;
            }>
          }
          subjectData={
            subjectData as unknown as Array<{ subject: string; count: number }>
          }
        />
      </div>

      {/* Tutors Table */}
      {/* @ts-expect-error - Type compatibility issue with UserInterface */}
      <TutorTable tutors={tutorsData.tutors} />

      {/* Add Tutor Modal */}
      <AddTutorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTutorAdded={handleTutorAdded}
      />
    </div>
  );
}
