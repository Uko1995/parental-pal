"use client";

import ChildInfoForm from "./ChildInfoForm";
import PhoneInput from "@/components/PhoneInput";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  TrashIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";
import { INITIAL_CHILD_ID } from "@/lib/booking-child-id";
import type { RebookFormEntries } from "@/lib/booking-rebook";
import {
  extractChildIdsFromFormEntries,
  parseJsonField,
  childDefaultsFromFormEntries,
} from "@/lib/rebook-form-utils";
import {
  applyParentContactPrefill,
  buildChildrenRowsFromProfile,
  type ChildInfoDefaults,
} from "@/lib/booking-profile-prefill";
import AddAnotherChildButton from "./AddAnotherChildButton";
import { useBookingProfilePrefill } from "./useBookingProfilePrefill";
import {
  CRECHE_CADENCE_LABELS,
  DEFAULT_HOMESCHOOL_RATES,
  GRADE_LEVELS_BY_TRACK,
  HOMESCHOOL_TERMS,
  HOMESCHOOL_TERM_ORDER,
  HOMESCHOOL_TRACKS,
  NEURODIVERGENT_SUPPORT_NOTE,
  TRACK_PROFILES,
  isCrecheCadence,
  isHomeschoolTrack,
  isTermTrack,
  type CrecheCadence,
  type HomeschoolRates,
  type HomeschoolTrack,
} from "@/lib/homeschool-program";
import { calculateHomeschoolPricing } from "@/lib/homeschool-pricing";

export interface HomeschoolingFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

interface ChildHomeschoolData {
  id: string;
  index: number;
  track: HomeschoolTrack;
  selectedSubjects: string[];
  gradeLevel: string;
  curriculum: string;
  learningStyle: string;
  specialNeeds: string;
  educationalGoals: string;
  selectedTerms: string[];
  isNewIntake: boolean;
  learningMaterials: boolean;
  transport: boolean;
  selectedEcas: string[];
  crecheCadence: CrecheCadence;
  crecheQuantity: number;
  afterschoolMonths: number;
}

interface HomeschoolingFormProps {
  initialTemplate?: RebookFormEntries | null;
}

function createChildRow(id: string, index: number): ChildHomeschoolData {
  return {
    id,
    index,
    track: "preschool",
    selectedSubjects: [],
    gradeLevel: "",
    curriculum: "",
    learningStyle: "",
    specialNeeds: "",
    educationalGoals: "",
    selectedTerms: [],
    isNewIntake: false,
    learningMaterials: false,
    transport: false,
    selectedEcas: [],
    crecheCadence: "month",
    crecheQuantity: 1,
    afterschoolMonths: 1,
  };
}

const HomeschoolingForm = forwardRef<HomeschoolingFormRef, HomeschoolingFormProps>(
  ({ initialTemplate }, ref) => {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentAddress, setParentAddress] = useState("");
  const [childDefaults, setChildDefaults] = useState<
    Record<string, ChildInfoDefaults>
  >({});

  const [childrenData, setChildrenData] = useState<ChildHomeschoolData[]>([
    createChildRow(INITIAL_CHILD_ID, 0),
  ]);

  // Admin-managed rate catalog; falls back to the versioned programme defaults.
  const [rates, setRates] = useState<HomeschoolRates>(DEFAULT_HOMESCHOOL_RATES);
  const templateAppliedRef = useRef(false);

  useEffect(() => {
    if (!initialTemplate || templateAppliedRef.current) return;
    templateAppliedRef.current = true;

    const childIds = extractChildIdsFromFormEntries(initialTemplate);
    if (childIds.length > 0) {
      setChildDefaults(childDefaultsFromFormEntries(initialTemplate, childIds));
      setChildrenData(
        childIds.map((id, index) => {
          const base = createChildRow(id, index);
          const rawTrack = initialTemplate[`track_${id}`];
          const rawCadence = initialTemplate[`crecheCadence_${id}`];

          return {
            ...base,
            track: isHomeschoolTrack(rawTrack) ? rawTrack : base.track,
            selectedSubjects: parseJsonField<string[]>(
              initialTemplate[`subjects_${id}`],
              [],
            ),
            gradeLevel: initialTemplate[`gradeLevel_${id}`] || "",
            curriculum: initialTemplate[`curriculum_${id}`] || "",
            learningStyle: initialTemplate[`learningStyle_${id}`] || "",
            specialNeeds: initialTemplate[`specialNeeds_${id}`] || "",
            educationalGoals: initialTemplate[`educationalGoals_${id}`] || "",
            selectedTerms: parseJsonField<string[]>(
              initialTemplate[`selectedTerms_${id}`],
              initialTemplate[`schoolTerm_${id}`]
                ? [String(initialTemplate[`schoolTerm_${id}`])]
                : [],
            ),
            isNewIntake: initialTemplate[`isNewIntake_${id}`] === "true",
            learningMaterials:
              initialTemplate[`learningMaterials_${id}`] === "true",
            transport: initialTemplate[`transport_${id}`] === "true",
            selectedEcas: parseJsonField<string[]>(
              initialTemplate[`selectedEcas_${id}`],
              [],
            ),
            crecheCadence: isCrecheCadence(rawCadence)
              ? rawCadence
              : base.crecheCadence,
            crecheQuantity:
              parseInt(initialTemplate[`crecheQuantity_${id}`] || "", 10) || 1,
            afterschoolMonths:
              parseInt(initialTemplate[`afterschoolMonths_${id}`] || "", 10) || 1,
          };
        }),
      );
    }
    if (initialTemplate.parentName) setParentName(initialTemplate.parentName);
    if (initialTemplate.parentEmail) setParentEmail(initialTemplate.parentEmail);
    if (initialTemplate.parentPhone) setParentPhone(initialTemplate.parentPhone);
    if (initialTemplate.parentAddress || initialTemplate.address) {
      setParentAddress(
        initialTemplate.parentAddress || initialTemplate.address || "",
      );
    }
  }, [initialTemplate]);

  const applyProfilePrefill = useCallback((profile: {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    parentAddress: string;
    children: Array<{ name: string; age: number; gender?: string }>;
  }) => {
    applyParentContactPrefill(profile, {
      setParentName,
      setParentEmail,
      setParentPhone,
      setParentAddress,
    });

    if (profile.children.length > 0) {
      const built = buildChildrenRowsFromProfile(
        profile.children,
        (id, index) => createChildRow(id, index),
      );
      if (built) {
        setChildDefaults(built.defaults);
        setChildrenData(built.rows);
      }
    }
  }, []);

  useBookingProfilePrefill({
    initialTemplate,
    templateAppliedRef,
    onApply: applyProfilePrefill,
  });

  // Fetch the live rate catalog from the homeschooling service record
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/services/pricing");
        const data = await response.json();
        if (data.success && data.data.homeschooling?.homeschool) {
          setRates(data.data.homeschooling.homeschool);
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

  const toggleTerm = useCallback((childId: string, term: string) => {
    setChildrenData((prev) =>
      prev.map((child) => {
        if (child.id !== childId) return child;
        const hasTerm = child.selectedTerms.includes(term);
        const selectedTerms = hasTerm
          ? child.selectedTerms.filter((t) => t !== term)
          : [...child.selectedTerms, term];
        return { ...child, selectedTerms };
      }),
    );
  }, []);

  const toggleEca = useCallback((childId: string, ecaCode: string) => {
    setChildrenData((prev) =>
      prev.map((child) => {
        if (child.id !== childId) return child;
        const hasEca = child.selectedEcas.includes(ecaCode);
        return {
          ...child,
          selectedEcas: hasEca
            ? child.selectedEcas.filter((code) => code !== ecaCode)
            : [...child.selectedEcas, ecaCode],
        };
      }),
    );
  }, []);

  const handleFieldChange = useCallback(
    (
      childId: string,
      field: keyof ChildHomeschoolData,
      value: string | number | boolean,
    ) => {
      setChildrenData((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, [field]: value } : child
        )
      );
    },
    []
  );

  // Switching track clears selections that no longer apply to the new track.
  const handleTrackChange = useCallback(
    (childId: string, track: HomeschoolTrack) => {
      setChildrenData((prev) =>
        prev.map((child) => {
          if (child.id !== childId) return child;

          const allowedGrades = isTermTrack(track)
            ? GRADE_LEVELS_BY_TRACK[track]
            : [];

          return {
            ...child,
            track,
            gradeLevel: allowedGrades.includes(child.gradeLevel)
              ? child.gradeLevel
              : "",
            selectedTerms: isTermTrack(track) ? child.selectedTerms : [],
            selectedEcas: isTermTrack(track) ? child.selectedEcas : [],
            isNewIntake: isTermTrack(track) ? child.isNewIntake : false,
            learningMaterials: isTermTrack(track)
              ? child.learningMaterials
              : false,
            transport: isTermTrack(track) ? child.transport : false,
          };
        }),
      );
    },
    [],
  );

  const addChild = () => {
    setChildrenData((prev) => [...prev, createChildRow(uuidv4(), prev.length)]);
  };

  const removeChild = (id: string) => {
    if (childrenData.length > 1) {
      setChildrenData((prev) => prev.filter((child) => child.id !== id));
    }
  };

  const resetForm = () => {
    setChildrenData([createChildRow(INITIAL_CHILD_ID, 0)]);
  };

  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    childrenData.forEach((child, index) => {
      const label = `Child ${index + 1}`;

      if (child.track === "creche") {
        if (child.crecheQuantity < 1) {
          errors.push(
            `${label}: Enter how many ${CRECHE_CADENCE_LABELS[child.crecheCadence]
              .replace("Per ", "")
              .toLowerCase()}s of creche care you need`,
          );
        }
        return;
      }

      if (child.track === "afterschool") {
        if (child.afterschoolMonths < 1) {
          errors.push(`${label}: Enter at least one month of afterschool care`);
        }
        return;
      }

      if (child.selectedSubjects.length === 0) {
        errors.push(`${label}: Please select at least one subject`);
      }
      if (!child.gradeLevel) {
        errors.push(`${label}: Please select a grade level`);
      }
      if (!child.curriculum) {
        errors.push(`${label}: Please select a curriculum`);
      }
      if (!child.selectedTerms.length) {
        errors.push(`${label}: Select at least one school term`);
      }
      if (!child.educationalGoals.trim()) {
        errors.push(`${label}: Please describe educational goals`);
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

  const pricing = useMemo(
    () =>
      calculateHomeschoolPricing(
        childrenData.map((child, index) => ({
          childId: child.id,
          childName: `Child #${index + 1}`,
          track: child.track,
          selectedTerms: child.selectedTerms,
          gradeLevel: child.gradeLevel,
          isNewIntake: child.isNewIntake,
          learningMaterials: child.learningMaterials,
          transport: child.transport,
          selectedEcas: child.selectedEcas,
          crecheCadence: child.crecheCadence,
          crecheQuantity: child.crecheQuantity,
          afterschoolMonths: child.afterschoolMonths,
        })),
        rates,
      ),
    [childrenData, rates],
  );

  const childHasPricing = (childId: string) =>
    pricing.lines.some((line) => line.childId === childId && line.total > 0);

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
            value={parentPhone}
            onValueChange={setParentPhone}
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
              value={parentAddress}
              onChange={(e) => setParentAddress(e.target.value)}
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
          Children & Programme Details
        </h2>
        <span className="badge badge-lg bg-gray-600 text-white border-0">
          {childrenData.length}{" "}
          {childrenData.length === 1 ? "Child" : "Children"}
        </span>
      </div>

      {/* Map through children - each gets complete section */}
      {childrenData.map((child, index) => {
        const profile = TRACK_PROFILES[child.track];
        const termTrack = isTermTrack(child.track) ? child.track : null;
        const gradeLevels = termTrack ? GRADE_LEVELS_BY_TRACK[termTrack] : [];

        return (
        <div
          key={child.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6"
        >
          {/* Child Header with Remove Button */}
          <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <AcademicCapIcon className="w-7 h-7 text-gray-600" />
              Child #{index + 1} - {profile.label}
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
            key={`${child.id}-${childDefaults[child.id]?.name ?? "new"}`}
            childIndex={index}
            childId={child.id}
            onRemove={() => removeChild(child.id)}
            showRemoveButton={false}
            defaults={childDefaults[child.id]}
          />

          {/* Programme Track Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-800">
                Programme <span className="text-red-600">*</span>
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HOMESCHOOL_TRACKS.map((trackId) => {
                const trackProfile = TRACK_PROFILES[trackId];
                const isSelected = child.track === trackId;
                return (
                  <label
                    key={trackId}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-[#90AC19] bg-[#90AC19]/10"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      className="radio mt-1 border-gray-400"
                      checked={isSelected}
                      onChange={() => handleTrackChange(child.id, trackId)}
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        {trackProfile.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {trackProfile.ageGroup} • {trackProfile.billingLabel}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <input
              type="hidden"
              name={`track_${child.id}`}
              value={child.track}
            />
          </div>

          {child.track === "gradeSchool" && (
            <div className="bg-[#FFEACF]/40 border border-[#E8931A]/30 rounded-lg p-4 flex gap-2">
              <SparklesIcon className="w-5 h-5 text-[#E8931A] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                {NEURODIVERGENT_SUPPORT_NOTE}
              </p>
            </div>
          )}

          {/* Creche booking */}
          {child.track === "creche" && (
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-gray-600" />
                Creche Booking
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-800">
                      Billing option <span className="text-red-600">*</span>
                    </span>
                  </label>
                  <select
                    value={child.crecheCadence}
                    onChange={(e) =>
                      handleFieldChange(
                        child.id,
                        "crecheCadence",
                        e.target.value,
                      )
                    }
                    className="select border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
                  >
                    {(
                      Object.keys(CRECHE_CADENCE_LABELS) as CrecheCadence[]
                    ).map((cadence) => (
                      <option key={cadence} value={cadence}>
                        {CRECHE_CADENCE_LABELS[cadence]} — ₦
                        {(rates.creche[cadence] ?? 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-800">
                      How many? <span className="text-red-600">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={child.crecheQuantity}
                    onChange={(e) =>
                      handleFieldChange(
                        child.id,
                        "crecheQuantity",
                        Math.max(1, parseInt(e.target.value, 10) || 1),
                      )
                    }
                    className="input border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
                  />
                </div>
              </div>
              <input
                type="hidden"
                name={`crecheCadence_${child.id}`}
                value={child.crecheCadence}
              />
              <input
                type="hidden"
                name={`crecheQuantity_${child.id}`}
                value={child.crecheQuantity}
              />
            </div>
          )}

          {/* Afterschool booking */}
          {child.track === "afterschool" && (
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-gray-600" />
                Afterschool Care
              </h4>
              <div className="form-control max-w-xs">
                <label className="label">
                  <span className="label-text font-semibold text-gray-800">
                    Number of months <span className="text-red-600">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={child.afterschoolMonths}
                  onChange={(e) =>
                    handleFieldChange(
                      child.id,
                      "afterschoolMonths",
                      Math.max(1, parseInt(e.target.value, 10) || 1),
                    )
                  }
                  className="input border-gray-300 bg-white focus:border-gray-600 focus:ring-2 focus:ring-gray-300 text-gray-800"
                />
                <span className="text-sm text-gray-600 mt-2">
                  ₦{(rates.afterschool.month ?? 0).toLocaleString()} per month
                </span>
              </div>
              <input
                type="hidden"
                name={`afterschoolMonths_${child.id}`}
                value={child.afterschoolMonths}
              />
            </div>
          )}

          {termTrack && (
            <>
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
                          onChange={() =>
                            handleSubjectChange(child.id, subject)
                          }
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
                  {HOMESCHOOL_TERM_ORDER.map((termId) => {
                    const term = HOMESCHOOL_TERMS[termId];
                    return (
                      <label
                        key={termId}
                        className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
                      >
                        <input
                          type="checkbox"
                          name={`schoolTerm_${child.id}_${termId}`}
                          checked={child.selectedTerms.includes(termId)}
                          onChange={() => toggleTerm(child.id, termId)}
                          className="checkbox border-gray-400"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {term.label} ({term.dateLabel})
                          </div>
                          <div className="text-sm text-gray-600">
                            ₦
                            {(
                              rates.tuitionByBand[termTrack] ?? 0
                            ).toLocaleString()}{" "}
                            per term
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <input
                  type="hidden"
                  name={`selectedTerms_${child.id}`}
                  value={JSON.stringify(child.selectedTerms)}
                />
                <input
                  type="hidden"
                  name={`schoolTerm_${child.id}`}
                  value={child.selectedTerms[0] || ""}
                />
              </div>

              {/* Additional term fees */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
                  Additional Fees
                </h4>
                <div className="space-y-3">
                  {rates.fees
                    .filter(
                      (fee) =>
                        !fee.appliesTo?.length ||
                        fee.appliesTo.includes(termTrack),
                    )
                    .map((fee) => {
                      const field =
                        fee.code === "developmentLevy"
                          ? "isNewIntake"
                          : fee.code === "learningMaterials"
                            ? "learningMaterials"
                            : "transport";
                      const checked = Boolean(
                        child[field as keyof ChildHomeschoolData],
                      );
                      const cadenceLabel =
                        fee.cadence === "perTerm"
                          ? "per term"
                          : fee.cadence === "oncePerYear"
                            ? "one off per year"
                            : "one off";

                      return (
                        <label
                          key={fee.code}
                          className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              handleFieldChange(child.id, field as keyof ChildHomeschoolData, !checked)
                            }
                            className="checkbox border-gray-400"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {fee.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              ₦{fee.amount.toLocaleString()} {cadenceLabel}
                              {fee.note ? ` • ${fee.note}` : ""}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                </div>
                <input
                  type="hidden"
                  name={`isNewIntake_${child.id}`}
                  value={String(child.isNewIntake)}
                />
                <input
                  type="hidden"
                  name={`learningMaterials_${child.id}`}
                  value={String(child.learningMaterials)}
                />
                <input
                  type="hidden"
                  name={`transport_${child.id}`}
                  value={String(child.transport)}
                />
              </div>

              {/* Extra-curricular activities */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <SparklesIcon className="w-5 h-5 text-gray-600" />
                  Extra-curricular Activities
                </h4>
                <div className="space-y-3">
                  {rates.ecas.map((eca) => (
                    <label
                      key={eca.code}
                      className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={child.selectedEcas.includes(eca.code)}
                        onChange={() => toggleEca(child.id, eca.code)}
                        className="checkbox border-gray-400"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {eca.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {eca.day ? `${eca.day} • ` : ""}₦
                          {eca.amount.toLocaleString()} per term
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <input
                  type="hidden"
                  name={`selectedEcas_${child.id}`}
                  value={JSON.stringify(child.selectedEcas)}
                />
              </div>
            </>
          )}

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
                placeholder={
                  child.track === "gradeSchool"
                    ? "Any diagnosis, therapy plan, learning need or accommodation we should plan for..."
                    : "Any learning disabilities, medical conditions, or special accommodations needed..."
                }
              />
            </div>

            {/* Educational Goals */}
            <div className="form-control flex flex-col w-full">
              <label className="label">
                <span className="label-text font-semibold text-gray-800">
                  Educational Goals{" "}
                  {termTrack && <span className="text-red-600">*</span>}
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
              />
            </div>
          </div>

          {/* Subtotal for this child */}
          {childHasPricing(child.id) && (
            <div className="bg-gray-200 border-2 border-gray-400 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">
                Subtotal for Child #{index + 1}
              </p>
              {pricing.lines
                .filter((line) => line.childId === child.id)
                .map((line) => (
                  <div
                    key={line.code}
                    className="flex justify-between items-center text-sm text-gray-700"
                  >
                    <span>
                      {line.description.split(" — ")[0]}
                      {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                    </span>
                    <span className="font-medium">
                      ₦{line.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between items-center border-t border-gray-400 pt-2">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-gray-800">
                  ₦
                  {pricing.lines
                    .filter((line) => line.childId === child.id)
                    .reduce((sum, line) => sum + line.total, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
        );
      })}

      <AddAnotherChildButton onClick={addChild} />

      {/* Hidden field for children count */}
      <input type="hidden" name="childrenCount" value={childrenData.length} />

      {/* Final Payment Summary */}
      {pricing.totalAmount > 0 && (
        <div className="bg-base-100 border border-base-300 rounded-lg p-6 shadow-sm">
          <h3 className="text-2xl font-bold flex items-center text-base-content mb-4">
            <CurrencyDollarIcon className="w-8 h-8 mr-2 text-base-content/70" />
            Final Payment Summary
          </h3>

          {/* Line-item breakdown */}
          <div className="space-y-2 mb-4">
            {pricing.lines.map((line) => (
              <div
                key={`${line.childId}-${line.code}`}
                className="flex justify-between items-center bg-base-200 p-3 rounded-lg border border-base-300"
              >
                <div>
                  <p className="text-sm font-medium text-base-content">
                    {line.description}
                  </p>
                  <p className="text-xs text-base-content/70">
                    {line.quantity} × ₦{line.unitPrice.toLocaleString()}
                  </p>
                </div>
                <p className="text-base font-bold text-base-content">
                  ₦{line.total.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="bg-gray-800 text-white p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Total Amount</p>
                <p className="text-sm opacity-90">All children combined</p>
              </div>
              <p className="text-3xl font-bold">
                ₦{pricing.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <input type="hidden" name="totalCost" value={pricing.totalAmount} />

          <div className="mt-4 bg-base-200 border border-base-300 rounded-lg p-4">
            <InformationCircleIcon className="w-5 h-5 text-brand-primary inline mr-2" />
            <span className="text-sm text-base-content">
              Creche, preschool, grade school and afterschool care with a
              structured curriculum, qualified educators and progress tracking.
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

HomeschoolingForm.displayName = "HomeschoolingForm";

export default HomeschoolingForm;
