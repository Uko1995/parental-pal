interface PaymentScheduleProps {
  totalHours?: number;
  serviceCost: number;
  totalDays?: number;
  childcare?: boolean;
  isMonthSelected?: boolean;
  monthlyChildcareRate?: number;
  event?: boolean;
  eventMode?: string;
  selectedServices?: Array<string | { service: string; quantity: number }>;
}

function PaymentSchedule({
  totalHours,
  childcare,
  serviceCost,
  totalDays,
  isMonthSelected,
  monthlyChildcareRate,
  event,
  eventMode,
  selectedServices,
}: PaymentScheduleProps) {
  const totalTime = childcare === true ? totalDays : totalHours;

  // Use monthly rate if month is selected, otherwise use regular calculation
  const totalCost =
    isMonthSelected && monthlyChildcareRate
      ? monthlyChildcareRate
      : (totalTime || 0) * serviceCost;

  // Event mode pricing
  const getEventModeCost = () => {
    switch (eventMode) {
      case "indoor":
        return 250000;
      case "outdoor":
        return 250000;
      case "indoorAndOutdoor":
        return 470000;
      default:
        return 0;
    }
  };

  // Extra services pricing
  const servicesPricing = {
    dj: 150000,
    mc: 60000,
    eventPlanning: 150000,
    carers: 10000, // per carer
  };

  const calculateExtraServicesCost = () => {
    if (!selectedServices) return 0;

    return selectedServices.reduce((total, service) => {
      if (typeof service === "string") {
        return (
          total +
          (servicesPricing[service as keyof typeof servicesPricing] || 0)
        );
      } else if (service.service === "carers") {
        return total + servicesPricing.carers * service.quantity;
      }
      return total;
    }, 0);
  };

  const eventModeCost = event ? getEventModeCost() : 0;
  const extraServicesCost = calculateExtraServicesCost();
  const totalEventCost = eventModeCost + extraServicesCost;

  return (
    <>
      {(totalHours || totalDays || event) && (
        <div className="mt-4 text-base flex justify-between text-gray-600 bg-green-50 p-5 rounded-lg border border-green-200">
          <span className="font-bold">
            {event
              ? "Event Services"
              : childcare
              ? isMonthSelected
                ? " Childcare (₦5,000/day) 15% discount per month"
                : " Childcare (₦5,000/day)"
              : " Academic tutoring (₦15,000/hour)"}
          </span>
          <span>
            {event
              ? `Event Package • Cost: ₦${totalEventCost.toLocaleString()}`
              : isMonthSelected
              ? "Full Month"
              : `${totalTime}${childcare ? " day" : " hour"}${
                  totalTime !== 1 ? "s" : ""
                }`}
            {!event && (
              <>
                {"   "}
                {"   "}
                {"   "} • Cost: <b>₦{totalCost.toLocaleString()}</b>
              </>
            )}
          </span>
          <input
            type="hidden"
            name="totalCost"
            value={event ? totalEventCost : totalCost}
          />
        </div>
      )}

      {/* Event Services Breakdown */}
      {event &&
        (eventMode || (selectedServices && selectedServices.length > 0)) && (
          <div className="mt-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3">
              Service Breakdown:
            </h4>

            {/* Event Mode Cost */}
            {eventMode && (
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span>
                  {eventMode === "indoor"
                    ? "Indoor Event"
                    : eventMode === "outdoor"
                    ? "Outdoor Event"
                    : "Indoor & Outdoor Event"}
                </span>
                <span>₦{getEventModeCost().toLocaleString()}</span>
              </div>
            )}

            {/* Extra Services */}
            {selectedServices &&
              selectedServices.map((service, index) => {
                if (typeof service === "string") {
                  const cost =
                    servicesPricing[service as keyof typeof servicesPricing] ||
                    0;
                  const serviceName =
                    service === "dj"
                      ? "DJ"
                      : service === "mc"
                      ? "MC (Master of Ceremonies)"
                      : service === "eventPlanning"
                      ? "Event Planning"
                      : service;
                  return (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-700 mb-1"
                    >
                      <span>{serviceName}</span>
                      <span>₦{cost.toLocaleString()}</span>
                    </div>
                  );
                } else if (service.service === "carers") {
                  const cost = servicesPricing.carers * service.quantity;
                  return (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-700 mb-1"
                    >
                      <span>Carers (x{service.quantity})</span>
                      <span>₦{cost.toLocaleString()}</span>
                    </div>
                  );
                }
                return null;
              })}

            {/* Refundable Caution Fee */}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm text-orange-600 font-medium">
                <span>Refundable Caution Fee</span>
                <span>₦50,000</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                This fee will be fully refunded after the event if no damages
                occur.
              </p>
            </div>
          </div>
        )}
    </>
  );
}

export default PaymentSchedule;
