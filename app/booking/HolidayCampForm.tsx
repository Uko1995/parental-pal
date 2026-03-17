import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ChildInfoForm from "./ChildInfoForm";
import PaymentSchedule from "./PaymentSchedule";
import PhoneInput from "@/components/PhoneInput";
import {
  UserIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";

export interface HolidayCampFormRef {
  resetForm: () => void;
  validate: () => { isValid: boolean; errors: string[] };
}

// Fixed camp dates
const CAMP_START_DATE = "2026-04-07";
const CAMP_END_DATE = "2026-04-25";
const CAMP_LABEL = "April 7 – April 25, 2026";

const EARLY_BIRD_END_ISO = "2026-04-01T00:00:00";
const EARLY_BIRD_RATE = 25000;
const REGULAR_CAMP_RATE = 30000;

const isEarlyBirdRateActive = () =>
  Date.now() < new Date(EARLY_BIRD_END_ISO).getTime();

const getEffectiveCampRate = (baseRate: number) =>
  isEarlyBirdRateActive() ? EARLY_BIRD_RATE : baseRate;

interface ChildCampData {
  id: string;
  index: number;
}

interface HolidayCampFormProps {
  onTotalChange?: (total: number) => void;
}

const HolidayCampForm = forwardRef<HolidayCampFormRef, HolidayCampFormProps>(
  (props, ref) => {
    const { data: session } = useSession();
    const [parentName, setParentName] = useState("");
    const [parentEmail, setParentEmail] = useState("");

    const [childrenData, setChildrenData] = useState<ChildCampData[]>([
      { id: uuidv4(), index: 0 },
    ]);

    // Flat per-child camp fee
    const [baseCampFee, setBaseCampFee] = useState(REGULAR_CAMP_RATE);
    const campFee = getEffectiveCampRate(baseCampFee);

    // Promo code states
    const [promoCode, setPromoCode] = useState("");
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState<string | null>(null);

    const EARLY_BIRD_CODE = "parentalpal-346267946393";
    const EARLY_BIRD_DISCOUNT_PER_CHILD = 5000;

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
            if (data["holiday-camps"]?.baseRate) {
              setBaseCampFee(data["holiday-camps"].baseRate);
            }
          }
        } catch (error) {
          console.error("Error fetching pricing:", error);
        }
      };
      fetchPricing();
    }, []);

    // Update total whenever children count or fee changes
    useEffect(() => {
      const subtotal = childrenData.length * campFee;
      const total = Math.max(0, subtotal - promoDiscount);
      props.onTotalChange?.(total);
    }, [childrenData.length, campFee, promoDiscount, props.onTotalChange]);

    const applyPromoCode = () => {
      const code = promoCode.trim().toUpperCase();

      if (!code) {
        setPromoDiscount(0);
        setPromoMessage("Please enter a promo code.");
        return;
      }

      if (code === EARLY_BIRD_CODE.toUpperCase()) {
        const totalDiscount =
          childrenData.length * EARLY_BIRD_DISCOUNT_PER_CHILD;
        setPromoDiscount(totalDiscount);
        setPromoMessage(
          `Early bird discount applied: ₦${totalDiscount.toLocaleString()} (${childrenData.length} × ₦${EARLY_BIRD_DISCOUNT_PER_CHILD.toLocaleString()})`,
        );
        return;
      }

      setPromoDiscount(0);
      setPromoMessage("Invalid promo code. Please check and try again.");
    };

    const addChild = () => {
      setChildrenData((prev) => [
        ...prev,
        { id: uuidv4(), index: prev.length },
      ]);
    };

    const removeChild = (id: string) => {
      if (childrenData.length > 1) {
        setChildrenData((prev) => prev.filter((child) => child.id !== id));
      }
    };

    const resetForm = () => {
      setChildrenData([{ id: uuidv4(), index: 0 }]);
      setPromoCode("");
      setPromoDiscount(0);
      setPromoMessage(null);
    };

    const validate = (): { isValid: boolean; errors: string[] } => {
      // No week selection needed; just ensure at least one child is registered
      return { isValid: true, errors: [] };
    };

    useImperativeHandle(ref, () => ({
      resetForm,
      validate,
    }));

    const subtotal = childrenData.length * campFee;
    const totalAfterDiscount = Math.max(0, subtotal - promoDiscount);

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

        {/* Camp Dates Banner */}
        <div className="bg-[#90AC19]/10 border-2 border-[#90AC19]/40 rounded-lg p-5 flex items-center gap-4">
          <CalendarIcon className="w-8 h-8 text-[#90AC19] shrink-0" />
          <div>
            <p className="text-base font-bold text-gray-900">
              Alive in Me Easter Camp Date
            </p>
            <p className="text-sm text-gray-700 mt-0.5">
              {CAMP_LABEL}... This is a fixed 3-week programme. Registration
              covers the full duration.
            </p>
          </div>
        </div>

        {/* Hidden fields for camp dates */}
        <input type="hidden" name="campStartDate" value={CAMP_START_DATE} />
        <input type="hidden" name="campEndDate" value={CAMP_END_DATE} />

        {/* Header for Children Sections */}
        <div className="flex items-center justify-between py-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Children Registered for Camp
          </h2>
          <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
            {childrenData.length}{" "}
            {childrenData.length === 1 ? "Child" : "Children"}
          </div>
        </div>

        {/* Map through children */}
        {childrenData.map((child, index) => (
          <div
            key={child.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 space-y-6"
          >
            {/* Child Header with Remove Button */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-gray-700" />
                Child #{index + 1} — Easter Camp Registration
              </h3>
              {childrenData.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChild(child.id)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors text-sm font-medium"
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

            {/* Camp Registration Confirmation */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#90AC19]" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Registered for Easter Camp
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{CAMP_LABEL}</p>
                </div>
              </div>
              <p className="text-base font-bold text-gray-800">
                ₦{campFee.toLocaleString()}
              </p>
            </div>

            {/* Per-child subtotal */}
            <div className="bg-gray-200 border-2 border-gray-400 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Subtotal for Child #{index + 1}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    One-time camp fee
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  ₦{campFee.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Child Button */}
        <button
          type="button"
          onClick={addChild}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-[#90AC19] hover:bg-[#90AC19]/5 hover:text-[#90AC19] transition-all duration-200 font-medium"
        >
          <PlusIcon className="w-6 h-6" />
          Add Another Child
        </button>

        {/* Hidden fields */}
        <input type="hidden" name="childrenCount" value={childrenData.length} />

        {/* Final Payment Summary */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold flex items-center text-gray-900 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 mr-2 text-gray-700" />
            Final Payment Summary
          </h3>
          {isEarlyBirdRateActive() && (
            <p className="text-sm text-green-700 mb-4">
              Early bird rate of ₦25,000 per child is available through March
              31, 2026 and reverts to ₦30,000 from April 1.
            </p>
          )}

          {/* Individual child costs */}
          <div className="space-y-3 mb-6">
            {childrenData.map((child, index) => (
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
                      Easter Camp — {CAMP_LABEL}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-800">
                    ₦{campFee.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Section */}
          {/* <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between items-end gap-4">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Promo Code
                </label>
                <input
                  type="text"
                  name="promoCode"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoMessage(null);
                    setPromoDiscount(0);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90AC19] focus:border-[#90AC19] text-gray-900 bg-white transition-colors"
                  placeholder="Enter promo code"
                />
              </div>
              <button
                type="button"
                onClick={applyPromoCode}
                className="btn btn-neutral h-12 self-end rounded-lg"
              >
                Apply
              </button>
            </div>
            {promoMessage && (
              <p
                className={`mt-3 text-sm ${
                  promoDiscount > 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {promoMessage}
              </p>
            )}
          </div> */}

          {/* PaymentSchedule Component */}
          <PaymentSchedule
            holidayCamp={true}
            numberOfChildren={childrenData.length}
            campFee={campFee}
            discountAmount={promoDiscount}
            discountLabel="Early bird discount"
          />

          <input type="hidden" name="campFee" value={campFee} />
          <input type="hidden" name="promoCode" value={promoCode} />
          <input type="hidden" name="promoDiscount" value={promoDiscount} />

          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 inline mr-2" />
            <span className="text-sm text-gray-700">
              Fun, educational holiday camp with supervised activities, meals,
              and excursions included. This is a one-time payment for the full
              camp programme.
            </span>
          </div>
        </div>
      </div>
    );
  },
);

HolidayCampForm.displayName = "HolidayCampForm";

export default HolidayCampForm;
