"use client";

import OptionalChild from "./OptionalChild";
import PaymentSchedule from "./PaymentSchedule";
import WeekdaysSchedule, { WeekdaysScheduleRef } from "./WeekdaysSchedule";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
} from "react";

export interface KiddiesEnrichmentFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

const KiddiesEnrichmentForm = forwardRef<KiddiesEnrichmentFormRef>(
  (props, ref) => {
    const [totalHours, setTotalHours] = useState(0);
    const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
    const [ageGroup, setAgeGroup] = useState("");
    const [interests, setInterests] = useState("");
    const [parentGoals, setParentGoals] = useState("");
    const [hourlyRate, setHourlyRate] = useState(8000); // Default to ₦8,000/hour
    const weekdaysScheduleRef = useRef<WeekdaysScheduleRef>(null);

    // Fetch pricing from database
    useEffect(() => {
      const fetchPricing = async () => {
        try {
          const response = await fetch("/api/services/pricing");
          if (response.ok) {
            const { data } = await response.json();
            if (data["kiddies-enrichment"]?.baseRate) {
              setHourlyRate(data["kiddies-enrichment"].baseRate);
            }
          }
        } catch (error) {
          console.error("Error fetching pricing:", error);
          // Keep default rate if fetch fails
        }
      };
      fetchPricing();
    }, []);

    const enrichmentPrograms = [
      "Arts & Crafts",
      "Music & Dance",
      "Sports & Physical Activities",
      "STEM Activities",
      "Drama & Theater",
      "Creative Writing",
      "Cooking & Nutrition",
      "Foreign Languages",
      "Public Speaking",
      "Leadership Skills",
      "Coding & Robotics",
      "Nature & Science Exploration",
    ];

    const ageGroups = [
      "Toddlers (1-2 years)",
      "Pre-School (3-5 years)",
      "Early Primary (5-7 years)",
      "Primary (7-10 years)",
      "Pre-Teen (10-12 years)",
    ];

    const handleHoursChange = (totalHours: number) => {
      setTotalHours(totalHours);
    };

    const handleProgramChange = (program: string) => {
      setSelectedPrograms((prev) => {
        if (prev.includes(program)) {
          return prev.filter((p) => p !== program);
        } else {
          return [...prev, program];
        }
      });
    };

    const resetForm = () => {
      setTotalHours(0);
      setSelectedPrograms([]);
      setAgeGroup("");
      setInterests("");
      setParentGoals("");
      weekdaysScheduleRef.current?.resetSchedule();
    };

    const validate = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (selectedPrograms.length === 0) {
        errors.push("Please select at least one enrichment program");
      }

      if (!ageGroup) {
        errors.push("Please select an age group");
      }

      if (totalHours === 0) {
        errors.push("Please select at least one day and specify hours");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    useImperativeHandle(ref, () => ({
      resetForm,
      validate,
    }));

    return (
      <div className="space-y-8">
        {/* Parent Information Section */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-xl flex items-center mb-6">
              <svg
                className="w-6 h-6 mr-2 text-[#90AC19]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              Parent/Guardian Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    Full Name *
                  </span>
                </label>
                <input
                  type="text"
                  name="parentName"
                  className="input input-bordered"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text font-medium">
                    Email Address *
                  </span>
                </label>
                <input
                  type="email"
                  name="parentEmail"
                  className="input input-bordered"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text font-medium">Phone Number *</span>
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  className="input input-bordered"
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
              </div>

              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text font-medium">Address *</span>
                </label>
                <input
                  type="text"
                  name="parentAddress"
                  className="input input-bordered"
                  placeholder="Enter your address"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Child Information Section */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-xl flex items-center mb-6">
              <svg
                className="w-6 h-6 mr-2 text-[#E8931A]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              Child Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text font-medium">
                    Child&apos;s Name *
                  </span>
                </label>
                <input
                  type="text"
                  name="childName"
                  className="input input-bordered"
                  placeholder="Enter child's full name"
                  required
                />
              </div>

              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text font-medium">Age *</span>
                </label>
                <input
                  type="number"
                  name="childAge"
                  className="input input-bordered"
                  placeholder="Enter child's age"
                  min="2"
                  max="12"
                  required
                />
              </div>
            </div>
            {/* Optional Additional Children */}
            <OptionalChild />

            <div className="form-control flex flex-col gap-2 mt-4">
              <label className="label">
                <span className="label-text font-medium">Age Group *</span>
              </label>
              <select
                name="ageGroup"
                className="select select-bordered"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                required
              >
                <option value="">Select age group</option>
                {ageGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enrichment Program Details Section */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-xl flex items-center mb-6">
              <svg
                className="w-6 h-6 mr-2 text-[#A25F97]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Enrichment Program Selection
            </h3>

            {/* Program Selection */}
            <div className="form-control flex flex-col gap-2 mb-6">
              <label className="label">
                <span className="label-text font-medium">
                  Select Programs of Interest *
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {enrichmentPrograms.map((program) => (
                  <label
                    key={program}
                    className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedPrograms.includes(program)}
                      onChange={() => handleProgramChange(program)}
                    />
                    <span className="label-text">{program}</span>
                  </label>
                ))}
              </div>
              <input
                type="hidden"
                name="selectedPrograms"
                value={JSON.stringify(selectedPrograms)}
              />
              <input type="hidden" name="hourlyRate" value={hourlyRate} />
              <span className="text-sm text-gray-500 mt-1">
                Choose one or more activities that interest your child
              </span>
            </div>

            {/* Child's Interests */}
            <div className="form-control flex flex-col gap-2 mb-6">
              <label className="label">
                <span className="label-text font-medium">
                  Child&apos;s Interests & Hobbies *
                </span>
              </label>
              <textarea
                name="interests"
                className="textarea textarea-bordered h-24"
                placeholder="Tell us about your child's interests, hobbies, and what they enjoy doing..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                required
              />
            </div>

            {/* Parent Goals */}
            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">
                  What are your goals for this program? *
                </span>
              </label>
              <textarea
                name="parentGoals"
                className="textarea textarea-bordered h-32"
                placeholder="What skills or abilities would you like your child to develop through this enrichment program?"
                value={parentGoals}
                onChange={(e) => setParentGoals(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-xl flex items-center mb-6">
              <svg
                className="w-6 h-6 mr-2 text-[#90AC19]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Weekly Schedule
            </h3>

            <WeekdaysSchedule
              ref={weekdaysScheduleRef}
              onHoursChange={handleHoursChange}
            />

            <div className="alert alert-info shadow-sm mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">
                Sessions are typically 1-2 hours. Select days and hours that
                work best for your child&apos;s schedule.
              </span>
            </div>
          </div>
        </div>

        {/* Payment Schedule */}
        <PaymentSchedule totalHours={totalHours} serviceCost={hourlyRate} />
      </div>
    );
  }
);

KiddiesEnrichmentForm.displayName = "KiddiesEnrichmentForm";

export default KiddiesEnrichmentForm;
