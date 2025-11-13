"use client";

import ChildInfoForm from "./ChildInfoForm";
import PaymentSchedule from "./PaymentSchedule";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import {
  UserIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";
import PhoneInput from "@/components/PhoneInput";

export interface KiddiesEnrichmentFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

interface ChildEnrichmentData {
  id: string;
  index: number;
  selectedPrograms: string[];
  interests: string;
  parentGoals: string;
  eventDate: string; // Single event date
  startTime: string; // Event start time
  hours: number; // Duration in hours
}

const KiddiesEnrichmentForm = forwardRef<KiddiesEnrichmentFormRef>(
  (props, ref) => {
    const { data: session } = useSession();
    const [parentName, setParentName] = useState("");
    const [parentEmail, setParentEmail] = useState("");

    const [childrenData, setChildrenData] = useState<ChildEnrichmentData[]>([
      {
        id: uuidv4(),
        index: 0,
        selectedPrograms: [],
        interests: "",
        parentGoals: "",
        eventDate: "",
        startTime: "",
        hours: 1, // Default 1 hours
      },
    ]);
    const [hourlyRate, setHourlyRate] = useState(8000); // Default to ₦8,000/hour

    // Autofill parent info from session
    useEffect(() => {
      if (session?.user) {
        if (session.user.name) setParentName(session.user.name);
        if (session.user.email) setParentEmail(session.user.email);
      }
    }, [session]);

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

    const handleProgramChange = useCallback(
      (childId: string, program: string) => {
        setChildrenData((prev) =>
          prev.map((child) =>
            child.id === childId
              ? {
                  ...child,
                  selectedPrograms: child.selectedPrograms.includes(program)
                    ? child.selectedPrograms.filter((p) => p !== program)
                    : [...child.selectedPrograms, program],
                }
              : child
          )
        );
      },
      []
    );

    const handleFieldChange = useCallback(
      (
        childId: string,
        field: keyof ChildEnrichmentData,
        value: string | number
      ) => {
        setChildrenData((prev) =>
          prev.map((child) =>
            child.id === childId ? { ...child, [field]: value } : child
          )
        );
      },
      []
    );

    const addChild = () => {
      const newChild: ChildEnrichmentData = {
        id: uuidv4(),
        index: childrenData.length,
        selectedPrograms: [],
        interests: "",
        parentGoals: "",
        eventDate: "",
        startTime: "",
        hours: 2,
      };
      setChildrenData((prev) => [...prev, newChild]);
    };

    const removeChild = (id: string) => {
      if (childrenData.length > 1) {
        setChildrenData((prev) => prev.filter((child) => child.id !== id));
      }
    };

    const resetForm = () => {
      const initialChild: ChildEnrichmentData = {
        id: uuidv4(),
        index: 0,
        selectedPrograms: [],
        interests: "",
        parentGoals: "",
        eventDate: "",
        startTime: "",
        hours: 2,
      };
      setChildrenData([initialChild]);
    };

    const validate = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      childrenData.forEach((child, index) => {
        if (child.selectedPrograms.length === 0) {
          errors.push(
            `Child ${index + 1}: Please select at least one enrichment program`
          );
        }

        if (!child.eventDate) {
          errors.push(`Child ${index + 1}: Please select an event date`);
        }

        if (!child.startTime) {
          errors.push(`Child ${index + 1}: Please select a start time`);
        }

        if (child.hours <= 0) {
          errors.push(
            `Child ${index + 1}: Please specify valid hours (minimum 1 hour)`
          );
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    // const calculateTotalCost = () => {
    //   return childrenData.reduce((total, child) => {
    //     return total + child.hours * hourlyRate;
    //   }, 0);
    // };

    useImperativeHandle(ref, () => ({
      resetForm,
      validate,
    }));

    return (
      <div className="space-y-8">
        {/* Parent Information Section */}
        <div className="card  shadow-lg border border-gray-300">
          <div className="card-body">
            <h3 className="text-lg md:text-xl font-semibold flex items-center text-gray-800 mb-6">
              <UserIcon className="w-6 h-6 mr-2 text-gray-600" />
              Parent/Guardian Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium text-gray-800">
                    Full Name <span className="text-red-600">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium text-gray-800">
                    Email Address <span className="text-red-600">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  name="parentEmail"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <PhoneInput
                name="parentPhone"
                label="Phone Number"
                required
                placeholder="Enter phone number"
              />

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium text-gray-800">
                    Address <span className="text-red-600">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="parentAddress"
                  className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
                  placeholder="Enter your address"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Children Sections */}
        {childrenData.map((child, index) => (
          <div
            key={child.id}
            className="card bg-white shadow-lg border-2 border-gray-300"
          >
            <div className="card-body">
              {/* Child Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center text-gray-800">
                  Child {index + 1} - Enrichment Details
                </h3>
                {childrenData.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChild(child.id)}
                    className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Remove
                  </button>
                )}
              </div>

              {/* Basic Child Information */}
              <div className="mb-8">
                <ChildInfoForm
                  childIndex={index}
                  childId={child.id}
                  onRemove={() => removeChild(child.id)}
                  showRemoveButton={false}
                />
              </div>

              {/* Enrichment Program Selection */}
              <div className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-800 font-medium text-lg">
                      Select Enrichment Programs{" "}
                      <span className="text-red-600">*</span>
                    </span>
                    <span className="label-text-alt text-gray-500">
                      Choose one or more programs
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {enrichmentPrograms.map((program) => (
                      <label
                        key={program}
                        className="label cursor-pointer justify-start space-x-3 hover:bg-gray-100 p-3 rounded-lg transition-colors border-2 border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={child.selectedPrograms.includes(program)}
                          onChange={() =>
                            handleProgramChange(child.id, program)
                          }
                          className="checkbox checkbox-sm border-2 border-gray-400 checked:border-gray-600 [--chkbg:var(--color-gray-600)] [--chkfg:white]"
                        />
                        <span className="label-text text-gray-700">
                          {program}
                        </span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="hidden"
                    name={`selectedPrograms_${child.id}`}
                    value={JSON.stringify(child.selectedPrograms)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 w-full">
                  {/* Child's Interests */}
                  <div className="form-control flex flex-col w-full">
                    <label className="label">
                      <span className="label-text text-gray-800 font-medium">
                        Child&apos;s Interests & Hobbies
                      </span>
                      <span className="label-text-alt text-gray-500">
                        What does this child enjoy?
                      </span>
                    </label>
                    <textarea
                      name={`interests_${child.id}`}
                      value={child.interests}
                      onChange={(e) =>
                        handleFieldChange(child.id, "interests", e.target.value)
                      }
                      className="textarea textarea-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800 h-24"
                      placeholder="Tell us about this child's interests, hobbies, and what they enjoy doing..."
                    />
                  </div>

                  {/* Parent Goals for this Child */}
                  <div className="form-control flex flex-col w-full">
                    <label className="label">
                      <span className="label-text text-gray-800 font-medium">
                        Program Goals for This Child
                      </span>
                      <span className="label-text-alt text-gray-500">
                        What skills would you like them to develop?
                      </span>
                    </label>
                    <textarea
                      name={`parentGoals_${child.id}`}
                      value={child.parentGoals}
                      onChange={(e) =>
                        handleFieldChange(
                          child.id,
                          "parentGoals",
                          e.target.value
                        )
                      }
                      className="textarea textarea-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800 h-24"
                      placeholder="What skills or abilities would you like this child to develop through this enrichment program?"
                    />
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-base text-gray-800 font-medium ">
                        Event Date <span className="text-red-600">*</span>
                      </span>
                      <span className="label-text-alt text-xs text-gray-500">
                        Select weekend date (Sat/Sun only)
                      </span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name={`eventDate_${child.id}`}
                        value={child.eventDate}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          const dayOfWeek = selectedDate.getDay();
                          // 0 = Sunday, 6 = Saturday
                          if (dayOfWeek === 0 || dayOfWeek === 6) {
                            handleFieldChange(
                              child.id,
                              "eventDate",
                              e.target.value
                            );
                          } else {
                            alert(
                              "Please select a weekend date (Saturday or Sunday)"
                            );
                          }
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-800 font-medium text-base">
                        Start Time <span className="text-red-600">*</span>
                      </span>
                      <span className="label-text-alt text-xs text-gray-500">
                        Event start time
                      </span>
                    </label>
                    <div className="relative">
                      <ClockIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name={`startTime_${child.id}`}
                        value={child.startTime}
                        onChange={(e) =>
                          handleFieldChange(
                            child.id,
                            "startTime",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 10:00 AM or 14:30"
                        className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-800 font-medium text-base">
                        Duration (Hours) <span className="text-red-600">*</span>
                      </span>
                      <span className="label-text-alt text-xs text-gray-500">
                        Event duration
                      </span>
                    </label>
                    <input
                      type="number"
                      name={`hours_${child.id}`}
                      value={child.hours}
                      onChange={(e) =>
                        handleFieldChange(
                          child.id,
                          "hours",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="1"
                      max="8"
                      className="input input-bordered border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div className="alert alert-info bg-blue-50 border-blue-300 mt-4">
                  <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    <strong>Weekends Only:</strong> Enrichment programs are
                    available on Saturdays and Sundays. Select date, start time,
                    and duration for this event.
                  </span>
                </div>

                {/* Individual Child Subtotal */}
                {child.hours > 0 && (
                  <div className="card bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
                    <div className="card-body py-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="w-6 h-6 text-gray-600" />
                          <span className="text-gray-700 font-medium">
                            Child {index + 1} Subtotal:
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {child.hours} {child.hours === 1 ? "hour" : "hours"}{" "}
                            × ₦{hourlyRate.toLocaleString()}/hour
                          </p>
                          <p className="text-2xl font-bold text-gray-800">
                            ₦{(child.hours * hourlyRate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Child Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addChild}
            className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 gap-2 px-8"
          >
            <PlusIcon className="w-5 h-5" />
            Add Another Child
          </button>
        </div>

        {/* Hidden Fields */}
        <input type="hidden" name="childrenCount" value={childrenData.length} />
        <input type="hidden" name="hourlyRate" value={hourlyRate} />

        {/* Payment Summary */}
        {childrenData.some((child) => child.hours > 0) && (
          <div className="card bg-linear-to-br from-gray-800 to-gray-900 text-white shadow-2xl border-2 border-gray-700">
            <div className="card-body">
              <h3 className="card-title text-2xl mb-4">
                <CurrencyDollarIcon className="w-7 h-7" />
                Payment Summary
              </h3>

              <div className="space-y-3 mb-4">
                {childrenData.map(
                  (child, index) =>
                    child.hours > 0 && (
                      <div
                        key={child.id}
                        className="flex justify-between items-center py-2 border-b border-gray-600"
                      >
                        <span className="text-gray-300">
                          Child {index + 1}: {child.hours}{" "}
                          {child.hours === 1 ? "hour" : "hours"}
                        </span>
                        <span className="font-semibold">
                          ₦{(child.hours * hourlyRate).toLocaleString()}
                        </span>
                      </div>
                    )
                )}
              </div>

              {/* PaymentSchedule Component */}
              <PaymentSchedule
                totalHours={childrenData.reduce(
                  (total, child) => total + child.hours,
                  0
                )}
                serviceCost={hourlyRate}
              />

              <div className="alert bg-gray-700 border-gray-600 mt-4">
                <InformationCircleIcon className="w-6 h-6" />
                <span className="text-sm">
                  Payment can be made via bank transfer, card payment, or at our
                  facility. You will receive payment instructions after booking
                  confirmation.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

KiddiesEnrichmentForm.displayName = "KiddiesEnrichmentForm";

export default KiddiesEnrichmentForm;
