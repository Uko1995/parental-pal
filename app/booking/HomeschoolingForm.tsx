"use client";

import ChildInfoForm from "./ChildInfoForm";
import PhoneInput from "@/components/PhoneInput";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import {
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";

export interface HomeschoolingFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

interface ChildHomeschoolData {
  id: string;
  index: number;
  selectedSubjects: string[];
  gradeLevel: string;
  curriculum: string;
  learningStyle: string;
  specialNeeds: string;
  educationalGoals: string;
  selectedTerm: "first" | "second" | "third" | "";
}

const HomeschoolingForm = forwardRef<HomeschoolingFormRef>((props, ref) => {
  const { data: session } = useSession();
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  const [childrenData, setChildrenData] = useState<ChildHomeschoolData[]>([
    {
      id: uuidv4(),
      index: 0,
      selectedSubjects: [],
      gradeLevel: "",
      curriculum: "",
      learningStyle: "",
      specialNeeds: "",
      educationalGoals: "",
      selectedTerm: "",
    },
  ]);

  // Base rate per term for homeschooling
  const [termRate, setTermRate] = useState(250000); // ₦250,000 per term (default)

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
        const data = await response.json();
        if (data.success && data.data.homeschooling) {
          setTermRate(data.data.homeschooling.baseRate);
        }
      } catch (error) {
        console.error("Error fetching homeschooling pricing:", error);
      }
    };
    fetchPricing();
  }, []);

  const subjects = [
    "Mathematics",
    "English Language",
    "Science",
    "Social Studies",
    "Arts & Crafts",
    "Physical Education",
    "Music",
    "Computer Skills",
    "Life Skills",
    "Religious Education",
  ];

  const gradeLevels = [
    "Pre-School (Ages 3-4)",
    "Kindergarten (Ages 5-6)",
    "Primary 1-3 (Ages 6-9)",
    "Primary 4-6 (Ages 9-12)",
  ];

  const curriculums = [
    "British Curriculum",
    "American Curriculum",
    "Nigerian Curriculum",
    "Montessori",
    "Waldorf",
    "Classical Education",
    "Unschooling",
    "Custom/Eclectic",
  ];

  const learningStyles = [
    "Visual Learner",
    "Auditory Learner",
    "Kinesthetic Learner",
    "Reading/Writing Learner",
    "Mixed Learning Style",
  ];

  const schoolTerms = [
    { value: "first", label: "First Term (September - December)" },
    { value: "second", label: "Second Term (January - April)" },
    { value: "third", label: "Third Term (May - August)" },
  ];

  const handleSubjectChange = useCallback(
    (childId: string, subject: string) => {
      setChildrenData((prev) =>
        prev.map((child) => {
          if (child.id === childId) {
            const updatedSubjects = child.selectedSubjects.includes(subject)
              ? child.selectedSubjects.filter((s) => s !== subject)
              : [...child.selectedSubjects, subject];
            return { ...child, selectedSubjects: updatedSubjects };
          }
          return child;
        })
      );
    },
    []
  );

  const handleFieldChange = useCallback(
    (childId: string, field: keyof ChildHomeschoolData, value: string) => {
      setChildrenData((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, [field]: value } : child
        )
      );
    },
    []
  );

  const addChild = () => {
    setChildrenData((prev) => [
      ...prev,
      {
        id: uuidv4(),
        index: prev.length,
        selectedSubjects: [],
        gradeLevel: "",
        curriculum: "",
        learningStyle: "",
        specialNeeds: "",
        educationalGoals: "",
        selectedTerm: "",
      },
    ]);
  };

  const removeChild = (id: string) => {
    if (childrenData.length > 1) {
      setChildrenData((prev) => prev.filter((child) => child.id !== id));
    }
  };

  const resetForm = () => {
    setChildrenData([
      {
        id: uuidv4(),
        index: 0,
        selectedSubjects: [],
        gradeLevel: "",
        curriculum: "",
        learningStyle: "",
        specialNeeds: "",
        educationalGoals: "",
        selectedTerm: "",
      },
    ]);
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    childrenData.forEach((child, index) => {
      if (child.selectedSubjects.length === 0) {
        errors.push(`Child ${index + 1}: Please select at least one subject`);
      }
      if (!child.gradeLevel) {
        errors.push(`Child ${index + 1}: Please select a grade level`);
      }
      if (!child.curriculum) {
        errors.push(`Child ${index + 1}: Please select a curriculum`);
      }
      if (!child.selectedTerm) {
        errors.push(`Child ${index + 1}: Please select a school term`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  useImperativeHandle(ref, () => ({
    resetForm,
    validate,
  }));

  // Calculate total cost for all children
  const calculateTotalCost = () => {
    return childrenData.reduce((total, child) => {
      if (child.selectedTerm) {
        return total + termRate;
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Parent Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold flex items-center mb-6 text-gray-900">
          <UserIcon className="w-6 h-6 mr-2 text-gray-700" />
          Parent/Guardian Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Full Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              name="parentName"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Email Address <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="email"
              name="parentEmail"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <PhoneInput
            name="parentPhone"
            label="Phone Number"
            required
            placeholder="Enter phone number"
          />

          <div>
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                Address <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              name="address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
              placeholder="Enter your address"
              required
            />
          </div>
        </div>
      </div>

      {/* Header for Children Sections */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl  font-bold text-gray-800">
          Children & Homeschooling Details
        </h2>
        <span className="badge badge-lg bg-gray-600 text-white border-0">
          {childrenData.length}{" "}
          {childrenData.length === 1 ? "Child" : "Children"}
        </span>
      </div>

      {/* Map through children - each gets complete section */}
      {childrenData.map((child, index) => (
        <div
          key={child.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6"
        >
          {/* Child Header with Remove Button */}
          <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <AcademicCapIcon className="w-7 h-7 text-gray-600" />
              Child #{index + 1} - Homeschooling Program
            </h3>
            {childrenData.length > 1 && (
              <button
                type="button"
                onClick={() => removeChild(child.id)}
                className="btn btn-sm btn-outline border-red-400 text-red-600 hover:bg-red-50 hover:border-red-600"
              >
                <TrashIcon className="w-4 h-4" />
                Remove Child
              </button>
            )}
          </div>

          {/* Basic Child Info */}
          <ChildInfoForm
            childIndex={index}
            childId={child.id}
            onRemove={() => removeChild(child.id)}
            showRemoveButton={false}
          />

          {/* Grade Level Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-800">
                Grade Level <span className="text-red-600">*</span>
              </span>
            </label>
            <select
              name={`gradeLevel_${child.id}`}
              value={child.gradeLevel}
              onChange={(e) =>
                handleFieldChange(child.id, "gradeLevel", e.target.value)
              }
              className="select border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
              required
            >
              <option value="">Select grade level</option>
              {gradeLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Curriculum Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-800">
                Preferred Curriculum <span className="text-red-600">*</span>
              </span>
            </label>
            <select
              name={`curriculum_${child.id}`}
              value={child.curriculum}
              onChange={(e) =>
                handleFieldChange(child.id, "curriculum", e.target.value)
              }
              className="select border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
              required
            >
              <option value="">Select curriculum</option>
              {curriculums.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          {/* Subjects Selection */}
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text font-semibold text-gray-800">
                Subjects <span className="text-red-600">*</span>
              </span>
              <span className="label-text-alt text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                Select all that apply
              </span>
            </label>
            <div className="flex flex-wrap gap-3">
              {subjects.map((subject) => (
                <div key={subject} className="form-control">
                  <label className="label cursor-pointer justify-start gap-3 p-3 rounded-lg border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-100 transition-all duration-200">
                    <input
                      type="checkbox"
                      className="checkbox border-2 border-gray-400 checked:border-gray-600"
                      checked={child.selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectChange(child.id, subject)}
                    />
                    <span className="label-text text-sm font-medium text-gray-800">
                      {subject}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <input
              type="hidden"
              name={`subjects_${child.id}`}
              value={JSON.stringify(child.selectedSubjects)}
            />
          </div>

          {/* Learning Style */}
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-semibold text-gray-800">
                Learning Style
              </span>
              <span className="label-text-alt text-xs text-gray-500">
                Optional - Helps us tailor the program
              </span>
            </label>
            <select
              name={`learningStyle_${child.id}`}
              value={child.learningStyle}
              onChange={(e) =>
                handleFieldChange(child.id, "learningStyle", e.target.value)
              }
              className="select border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
            >
              <option value="">Select learning style</option>
              {learningStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          {/* School Term Selection */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <BookOpenIcon className="w-5 h-5 text-gray-600" />
              School Term Registration
            </h4>
            <div className="space-y-3">
              {schoolTerms.map((term) => (
                <label
                  key={term.value}
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
                >
                  <input
                    type="radio"
                    name={`schoolTerm_${child.id}`}
                    value={term.value}
                    checked={child.selectedTerm === term.value}
                    onChange={() =>
                      handleFieldChange(
                        child.id,
                        "selectedTerm",
                        term.value as "first" | "second" | "third"
                      )
                    }
                    className="radio border-gray-400"
                    required
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {term.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      ₦{termRate.toLocaleString()} per term
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Special Needs */}
            <div className="form-control flex flex-col w-full">
              <label className="label">
                <span className="label-text font-semibold text-gray-800">
                  Special Needs or Accommodations
                </span>
                <span className="label-text-alt text-xs text-gray-500">
                  Optional
                </span>
              </label>
              <textarea
                name={`specialNeeds_${child.id}`}
                value={child.specialNeeds}
                onChange={(e) =>
                  handleFieldChange(child.id, "specialNeeds", e.target.value)
                }
                className="textarea border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800 h-24"
                placeholder="Any learning disabilities, medical conditions, or special accommodations needed..."
              />
            </div>

            {/* Educational Goals */}
            <div className="form-control flex flex-col w-full">
              <label className="label">
                <span className="label-text font-semibold text-gray-800">
                  Educational Goals <span className="text-red-600">*</span>
                </span>
                <span className="label-text-alt text-xs text-gray-500">
                  What do you hope to achieve this term?
                </span>
              </label>
              <textarea
                name={`educationalGoals_${child.id}`}
                value={child.educationalGoals}
                onChange={(e) =>
                  handleFieldChange(
                    child.id,
                    "educationalGoals",
                    e.target.value
                  )
                }
                className="textarea border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800 h-24"
                placeholder="e.g., Master multiplication tables, improve reading comprehension, develop critical thinking skills..."
                required
              />
            </div>
          </div>

          {/* Subtotal for this child */}
          {child.selectedTerm &&
            child.selectedSubjects.length > 0 &&
            child.gradeLevel &&
            child.curriculum && (
              <div className="bg-gray-200 border-2 border-gray-400 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Subtotal for Child #{index + 1}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      1 term •{" "}
                      {
                        schoolTerms.find((t) => t.value === child.selectedTerm)
                          ?.label
                      }
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    ₦{termRate.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
        </div>
      ))}

      {/* Add Another Child Button */}
      <button
        type="button"
        onClick={addChild}
        className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-600 w-full text-lg py-6"
      >
        <PlusIcon className="w-6 h-6" />
        Add Another Child
      </button>

      {/* Hidden field for children count */}
      <input type="hidden" name="childrenCount" value={childrenData.length} />

      {/* Final Payment Summary */}
      {childrenData.some(
        (child) =>
          child.selectedTerm &&
          child.selectedSubjects.length > 0 &&
          child.gradeLevel &&
          child.curriculum
      ) && (
        <div className="bg-linear-to-br from-gray-100 to-gray-200 border-4 border-gray-500 rounded-lg p-6 shadow-xl">
          <h3 className="text-2xl font-bold flex items-center text-gray-800 mb-4">
            <CurrencyDollarIcon className="w-8 h-8 mr-2 text-gray-600" />
            Final Payment Summary
          </h3>

          {/* Individual child costs */}
          <div className="space-y-3 mb-4">
            {childrenData.map((child, index) => {
              if (
                child.selectedTerm &&
                child.selectedSubjects.length > 0 &&
                child.gradeLevel &&
                child.curriculum
              ) {
                return (
                  <div
                    key={child.id}
                    className="bg-white p-4 rounded-lg border-2 border-gray-300"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Child #{index + 1}
                        </p>
                        <p className="text-sm text-gray-600">
                          {child.curriculum} • {child.selectedSubjects.length}{" "}
                          subjects •{" "}
                          {
                            schoolTerms
                              .find((t) => t.value === child.selectedTerm)
                              ?.label.split("(")[0]
                          }
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        ₦{termRate.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Grand Total */}
          <div className="bg-gray-800 text-white p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Total Amount</p>
                <p className="text-sm opacity-90">All children combined</p>
              </div>
              <p className="text-3xl font-bold">
                ₦{calculateTotalCost().toLocaleString()}
              </p>
            </div>
          </div>

          <input type="hidden" name="termRate" value={termRate} />
          <input type="hidden" name="totalCost" value={calculateTotalCost()} />

          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 inline mr-2" />
            <span className="text-sm text-gray-700">
              Comprehensive homeschooling program with personalized curriculum,
              qualified educators, and progress tracking.
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

HomeschoolingForm.displayName = "HomeschoolingForm";

export default HomeschoolingForm;
