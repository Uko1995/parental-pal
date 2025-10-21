"use client";

import { useState, useRef } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import PersonalInfoTab from "./PersonalInfoTab";
import ProfessionalInfoTab from "./ProfessionalInfoTab";
import AvailabilityTab from "./AvailabilityTab";
import ReviewTab from "./ReviewTab";
import toast from "react-hot-toast";

export interface TutorFormData {
  // Personal Information
  userData: {
    expiresAt: string;
    user: {
      name: string;
      email: string;
      image: string | null;
    };
  };
  phone: string;
  address: string;

  // Professional Information
  specialty: string;
  experience: number;
  qualifications: string[];
  subjects: string[];
  hourlyRate: number;
  bio: string;

  // Availability
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  hourlyRateAccepted: boolean;

  // Preferences
  preferredServices: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const initialFormData: TutorFormData = {
  userData: {
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      name: "",
      email: "",
      image: null,
    },
  },
  phone: "",
  address: "",
  specialty: "",
  experience: 0,
  qualifications: [],
  subjects: [],
  hourlyRate: 15000,
  bio: "",
  availability: {
    days: [],
    hours: {
      start: "09:00",
      end: "17:00",
    },
  },
  hourlyRateAccepted: false,
  preferredServices: [],
  emergencyContact: {
    name: "",
    phone: "",
    relationship: "",
  },
};

export default function TutorRegistrationForm() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<TutorFormData>(initialFormData);
  const [completedTabs, setCompletedTabs] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Function to scroll to top of form
  const scrollToTop = () => {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const tabs = [
    { id: 0, title: "Personal Info", description: "Basic details about you" },
    {
      id: 1,
      title: "Professional Info",
      description: "Your expertise and experience",
    },
    {
      id: 2,
      title: "Availability",
      description: "When you're available to teach",
    },
    {
      id: 3,
      title: "Review",
      description: "Review and submit your application",
    },
  ];

  const updateFormData = (updates: Partial<TutorFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Validation helper functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Nigerian phone number: +234 followed by 10 digits
    const phoneRegex = /^\+234\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const validateTab = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0: // Personal Info
        return !!(
          validateName(formData.userData.user.name) &&
          validateEmail(formData.userData.user.email) &&
          validatePhoneNumber(formData.phone) &&
          formData.address.trim()
        );
      case 1: // Professional Info
        return !!(
          formData.specialty.trim() &&
          formData.experience > 0 &&
          formData.subjects.length > 0 &&
          formData.bio.trim()
        );
      case 2: // Availability
        return !!(
          formData.availability.days.length > 0 &&
          formData.availability.hours.start &&
          formData.availability.hours.end &&
          formData.hourlyRateAccepted
        );
      case 3: // Review
        return (
          validateTab(0) && validateTab(1) && validateTab(2) && termsAccepted
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateTab(activeTab)) {
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs((prev) => [...prev, activeTab]);
      }
      if (activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
        scrollToTop();
      }
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
      scrollToTop();
    }
  };

  const handleTabClick = (tabIndex: number) => {
    // Only allow navigation to previous tabs or completed tabs
    if (tabIndex <= activeTab || completedTabs.includes(tabIndex)) {
      setActiveTab(tabIndex);
      scrollToTop();
    }
  };

  const handleSubmit = async () => {
    if (!validateTab(3)) return;

    setIsSubmitting(true);
    try {
      console.log("Submitting Tutor Application:", formData);
      const response = await fetch("/api/tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "tutor",
          isActive: false, // Pending approval
          tutorProfile: {
            specialty: formData.specialty,
            experience: formData.experience,
            qualifications: formData.qualifications,
            subjects: formData.subjects,
            rating: 0,
            totalReviews: 0,
            availability: formData.availability,
            hourlyRate: formData.hourlyRate,
            hourlyRateAccepted: formData.hourlyRateAccepted,
            bio: formData.bio,
            isVerified: false,
          },
          userData: {
            expiresAt: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days
            user: {
              name: formData.userData.user.name,
              email: formData.userData.user.email,
              image: formData.userData.user.image || null,
            },
          },
          preferences: {
            notifications: {
              email: true,
              sms: true,
              push: true,
            },
            preferredServices: formData.preferredServices,
            emergencyContact: formData.emergencyContact,
          },
        }),
      });

      if (response.ok) {
        // Success - show success message or redirect
        toast.success(
          "Application submitted successfully! We'll review your application and get back to you soon."
        );
        // Reset form completely
        setFormData(initialFormData);
        setActiveTab(0);
        setCompletedTabs([]);
        setTermsAccepted(false);

        // Scroll to top of form
        scrollToTop();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <PersonalInfoTab
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 1:
        return (
          <ProfessionalInfoTab
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <AvailabilityTab
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <ReviewTab
            formData={formData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onTermsChange={setTermsAccepted}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={formRef}
      className="max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="card shadow-xl transition-all duration-300"
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="card-body p-8 sm:p-10">
          {/* Progress Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h2
                  className="md:text-3xl text-lg font-bold"
                  style={{ color: "#90AC19" }}
                >
                  Tutor Registration
                </h2>
                <p className="text-gray-600">
                  Complete your application to join our team
                </p>
              </div>
              <div
                className="px-4 py-2 rounded-full border"
                style={{ backgroundColor: "#90AC19", borderColor: "#90AC19" }}
              >
                <span className="text-sm font-semibold text-white">
                  {activeTab + 1} of {tabs.length}
                </span>
              </div>
            </div>

            <div className="flex w-full items-center justify-between px-6 mb-8">
              {tabs.map((tab, index) => (
                <motion.div
                  key={tab.id}
                  className="flex items-center flex-1 justify-center relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <motion.button
                    onClick={() => handleTabClick(index)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold relative z-10 transition-all duration-300 border-2 ${
                      completedTabs.includes(index)
                        ? "text-white cursor-pointer shadow-lg"
                        : index === activeTab
                        ? "text-white shadow-lg"
                        : index < activeTab || completedTabs.includes(index)
                        ? "bg-gray-200 text-gray-600 cursor-pointer border-gray-300"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-gray-200"
                    }`}
                    style={
                      completedTabs.includes(index) || index === activeTab
                        ? {
                            backgroundColor: "#90AC19",
                            borderColor: "#90AC19",
                          }
                        : {}
                    }
                    whileHover={{
                      scale:
                        index <= activeTab || completedTabs.includes(index)
                          ? 1.1
                          : 1,
                    }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: index === activeTab ? 1.1 : 1,
                      rotate: completedTabs.includes(index) ? 360 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17,
                      rotate: { duration: 0.6, ease: "easeInOut" },
                    }}
                    disabled={
                      index > activeTab && !completedTabs.includes(index)
                    }
                  >
                    {completedTabs.includes(index) ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </motion.button>
                  {index < tabs.length - 1 && (
                    <motion.div
                      className="absolute left-1/2 top-1/2 transform -translate-y-1/2 w-full h-1 -z-10 rounded-full bg-gray-200"
                      style={
                        completedTabs.includes(index) || index < activeTab
                          ? { backgroundColor: "#90AC19" }
                          : {}
                      }
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX:
                          completedTabs.includes(index) || index < activeTab
                            ? 1
                            : 0,
                      }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="w-full mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(index)}
                  className={`p-5 rounded-xl border transition-all duration-300 text-left transform hover:-translate-y-1 hover:shadow-lg group ${
                    index === activeTab
                      ? "shadow-lg scale-105"
                      : completedTabs.includes(index)
                      ? ""
                      : index < activeTab
                      ? "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400"
                      : "border-gray-200 bg-gray-50/50 text-gray-400 cursor-not-allowed opacity-60"
                  }`}
                  style={
                    index === activeTab
                      ? {
                          borderColor: "#90AC19",
                          color: "#90AC19",
                        }
                      : completedTabs.includes(index)
                      ? {
                          borderColor: "#90AC19",
                          backgroundColor: "transparent",
                          color: "#90AC19",
                        }
                      : {}
                  }
                  disabled={index > activeTab && !completedTabs.includes(index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-sm group-hover:text-current transition-colors">
                      {tab.title}
                    </div>
                  </div>
                  <div className="text-xs text-current opacity-80 leading-relaxed">
                    {tab.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px] rounded-2xl p-6 border border-gray-200 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                  scale: { duration: 0.2 },
                }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <motion.div
            className="flex justify-between items-center mt-10 pt-8 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.button
              onClick={handlePrevious}
              className={`btn btn-outline btn-lg ${
                activeTab === 0
                  ? "btn-disabled opacity-50"
                  : "hover:bg-gray-100"
              }`}
              disabled={activeTab === 0}
              whileHover={activeTab === 0 ? {} : { scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              Previous
            </motion.button>

            {activeTab < tabs.length - 1 ? (
              <motion.button
                onClick={handleNext}
                className={`btn btn-lg text-white ${
                  !validateTab(activeTab)
                    ? "btn-disabled opacity-50"
                    : "hover:opacity-90"
                }`}
                style={{ backgroundColor: "#90AC19", borderColor: "#90AC19" }}
                disabled={!validateTab(activeTab)}
                whileHover={
                  !validateTab(activeTab)
                    ? {}
                    : {
                        scale: 1.05,
                        y: -2,
                        boxShadow: "0 10px 25px rgba(144, 172, 25, 0.3)",
                      }
                }
                whileTap={{ scale: 0.95 }}
              >
                Continue
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                className={`btn btn-lg text-white ${
                  !validateTab(3) || isSubmitting || !termsAccepted
                    ? "btn-disabled opacity-50"
                    : "hover:opacity-90"
                }`}
                style={{ backgroundColor: "#90AC19", borderColor: "#90AC19" }}
                disabled={!validateTab(3) || isSubmitting || !termsAccepted}
                whileHover={
                  !validateTab(3) || isSubmitting || !termsAccepted
                    ? {}
                    : {
                        scale: 1.05,
                        y: -2,
                        boxShadow: "0 10px 25px rgba(144, 172, 25, 0.3)",
                      }
                }
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Submit Application
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
