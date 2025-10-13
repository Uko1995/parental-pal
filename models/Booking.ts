import { ObjectId } from "mongodb";

// TypeScript interface for type safety
export interface BookingInterface {
  _id?: ObjectId;
  userId: ObjectId; // Reference to User
  serviceType:
    | "childcare"
    | "tutoring"
    | "homeschooling"
    | "holiday-camps"
    | "space-rental"
    | "kiddies-enrichment";

  // Common booking fields
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string;
  childrenCount: number;
  children: Array<{
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
  }>;

  // Service-specific data
  serviceData: {
    // Tutoring specific
    subjects?: string[];
    academicLevel?: string;
    learningGoals?: string;
    hourlyRate?: number;

    // Childcare specific
    careType?: "daily" | "monthly";
    dropoffTime?: string;
    pickupTime?: string;
    specialNeeds?: string;
    dailyRate?: number;
    monthlyRate?: number;

    // Holiday camp specific
    campWeeks?: Array<{
      startDate: string;
      endDate: string;
      weekNumber: number;
    }>;
    weeklyRate?: number;

    // Event/Space rental specific
    eventType?: string;
    eventDate?: string;
    eventTime?: string;
    venueType?: "indoor" | "outdoor" | "both";
    expectedGuests?: number;
    extraServices?: Array<{
      service: "dj" | "mc" | "event-planning" | "extra-carers";
      quantity?: number;
      rate?: number;
    }>;
    cautionFee?: number;
    baseRate?: number;
  };

  // Schedule information
  schedule: {
    startDate: string;
    endDate?: string;
    weekdays?: Array<{
      day:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday";
      hours: number;
      startTime?: string;
      endTime?: string;
    }>;
    isRecurring: boolean;
    frequency?: "daily" | "weekly" | "monthly";
  };

  // Pricing breakdown
  pricing: {
    baseAmount: number;
    extraServicesAmount?: number;
    cautionFee?: number;
    discount?: {
      type: "percentage" | "fixed";
      value: number;
      reason?: string;
    };
    totalAmount: number;
    currency: string;
  };

  // Payment information
  payment: {
    method?: "card" | "bank_transfer" | "cash" | "installments";
    status: "pending" | "paid" | "refunded";
    installments?: Array<{
      amount: number;
      dueDate: string;
      paidDate?: string;
      status: "pending" | "paid" | "overdue";
    }>;
    paidAmount: number;
    paymentDate?: string;
    transactionId?: string;
  };

  // Booking status and management
  status:
    | "pending"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "on-hold";
  priority?: "low" | "normal" | "high" | "urgent";

  // Assignment and fulfillment
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Timestamps and metadata
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;

  // Source tracking
  source:
    | "social media"
    | "online search"
    | "signage"
    | "referral"
    | "walk in"
    | "other";
  referralSource?: string;

  // Follow-up and relationship management
  followUpRequired: boolean;
  followUpDate?: Date;
  isRepeatedCustomer: boolean;
  previousBookingIds?: ObjectId[];
}

// MongoDB schema validation
export const BookingSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "userId",
        "serviceType",
        "parentName",
        "parentEmail",
        "parentPhone",
        "childrenCount",
        "children",
        "serviceData",
        "schedule",
        "pricing",
        "payment",
        "status",
        "createdAt",
        "updatedAt",
        "source",
        "followUpRequired",
        "isRepeatedCustomer",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        serviceType: {
          bsonType: "string",
          enum: [
            "childcare",
            "tutoring",
            "homeschooling",
            "holiday-camps",
            "space-rental",
            "kiddies-enrichment",
          ],
        },

        // Contact information
        parentName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
        },
        parentEmail: {
          bsonType: "string",
          pattern: "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$",
        },
        parentPhone: {
          bsonType: "string",
          pattern: "^\\d{4}-\\d{3}-\\d{4}$",
        },
        childrenCount: {
          bsonType: "number",
          minimum: 1,
          maximum: 10,
        },
        children: {
          bsonType: "array",
          minItems: 1,
          maxItems: 10,
          items: {
            bsonType: "object",
            required: ["name", "age"],
            properties: {
              name: { bsonType: "string", minLength: 2, maxLength: 50 },
              age: { bsonType: "number", minimum: 1, maximum: 10 },
              class: { bsonType: "string", maxLength: 20 },
              schoolName: { bsonType: "string", maxLength: 100 },
            },
          },
        },

        // Service data with conditional validation
        serviceData: {
          bsonType: "object",
          properties: {
            subjects: {
              bsonType: "array",
              items: { bsonType: "string" },
            },
            tutorGender: {
              bsonType: "string",
              enum: ["male", "female", "any"],
            },
            academicLevel: { bsonType: "string" },
            learningGoals: { bsonType: "string" },
            hourlyRate: { bsonType: "number", minimum: 0 },
            careType: {
              bsonType: "string",
              enum: ["daily", "monthly"],
            },
            dropoffTime: {
              bsonType: "string",
              pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
            },
            pickupTime: {
              bsonType: "string",
              pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
            },
            specialNeeds: { bsonType: "string" },
            dailyRate: { bsonType: "number", minimum: 0 },
            monthlyRate: { bsonType: "number", minimum: 0 },
            campWeeks: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["startDate", "endDate", "weekNumber"],
                properties: {
                  startDate: { bsonType: "string" },
                  endDate: { bsonType: "string" },
                  weekNumber: { bsonType: "number", minimum: 1 },
                },
              },
            },
            weeklyRate: { bsonType: "number", minimum: 0 },
            eventType: {
              bsonType: "string",
              enum: ["birthday", "ceremony", "meeting", "other"],
            },
            eventDate: { bsonType: "string" },
            eventTime: {
              bsonType: "string",
              pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
            },
            venueType: {
              bsonType: "string",
              enum: ["indoor", "outdoor", "both"],
            },
            expectedGuests: { bsonType: "number", minimum: 1 },
            extraServices: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["service"],
                properties: {
                  service: {
                    bsonType: "string",
                    enum: ["dj", "mc", "event-planning", "extra-carers"],
                  },
                  quantity: { bsonType: "number", minimum: 1 },
                  rate: { bsonType: "number", minimum: 0 },
                },
              },
            },
            cautionFee: { bsonType: "number", minimum: 0 },
            baseRate: { bsonType: "number", minimum: 0 },
          },
        },

        // Schedule validation
        schedule: {
          bsonType: "object",
          required: ["startDate", "isRecurring"],
          properties: {
            startDate: { bsonType: "string" },
            endDate: { bsonType: "string" },
            weekdays: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["day", "hours"],
                properties: {
                  day: {
                    bsonType: "string",
                    enum: [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ],
                  },
                  hours: { bsonType: "number", minimum: 0.5, maximum: 12 },
                  startTime: {
                    bsonType: "string",
                    pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
                  },
                  endTime: {
                    bsonType: "string",
                    pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
                  },
                },
              },
            },
            isRecurring: { bsonType: "bool" },
            frequency: {
              bsonType: "string",
              enum: ["daily", "weekly", "monthly"],
            },
          },
        },

        // Pricing validation
        pricing: {
          bsonType: "object",
          required: ["baseAmount", "totalAmount", "currency"],
          properties: {
            baseAmount: { bsonType: "number", minimum: 0 },
            extraServicesAmount: { bsonType: "number", minimum: 0 },
            cautionFee: { bsonType: "number", minimum: 0 },
            discount: {
              bsonType: "object",
              required: ["type", "value"],
              properties: {
                type: {
                  bsonType: "string",
                  enum: ["percentage", "fixed"],
                },
                value: { bsonType: "number", minimum: 0 },
                reason: { bsonType: "string" },
              },
            },
            totalAmount: { bsonType: "number", minimum: 0 },
            currency: {
              bsonType: "string",
              enum: ["NGN", "USD", "EUR", "GBP"],
            },
          },
        },

        // Payment validation
        payment: {
          bsonType: "object",
          required: ["status", "paidAmount"],
          properties: {
            method: {
              bsonType: "string",
              enum: ["card", "bank_transfer", "cash", "installments"],
            },
            status: {
              bsonType: "string",
              enum: ["pending", "paid", "refunded"],
            },
            installments: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["amount", "dueDate", "status"],
                properties: {
                  amount: { bsonType: "number", minimum: 0 },
                  dueDate: { bsonType: "string" },
                  paidDate: { bsonType: "string" },
                  status: {
                    bsonType: "string",
                    enum: ["pending", "paid", "overdue"],
                  },
                },
              },
            },
            paidAmount: { bsonType: "number", minimum: 0 },
            paymentDate: { bsonType: "string" },
            transactionId: { bsonType: "string" },
          },
        },

        // Status and assignment
        status: {
          bsonType: "string",
          enum: [
            "pending",
            "confirmed",
            "in-progress",
            "completed",
            "cancelled",
            "on-hold",
          ],
        },
        priority: {
          bsonType: "string",
          enum: ["low", "normal", "high", "urgent"],
        },
        startedAt: { bsonType: "date" },
        completedAt: { bsonType: "date" },
        assignedAt: { bsonType: "date" },

        // Timestamps
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        cancelledAt: { bsonType: "date" },
        cancellationReason: { bsonType: "string", maxLength: 500 },

        // Source tracking
        source: {
          bsonType: "string",
          enum: [
            "social media",
            "walk in",
            "online search",
            "referral",
            "signage",
            "other",
          ],
        },
        referralSource: { bsonType: "string", maxLength: 100 },

        // Follow-up
        followUpRequired: { bsonType: "bool" },
        followUpDate: { bsonType: "date" },
        isRepeatedCustomer: { bsonType: "bool" },
        previousBookingIds: {
          bsonType: "array",
          items: { bsonType: "objectId" },
        },
      },
    },
  },
};

// Indexes for optimal performance
export const BookingIndexes = [
  // Primary lookups
  {
    key: { userId: 1 },
    name: "idx_user_bookings",
  },
  {
    key: { parentEmail: 1 },
    name: "idx_parent_email",
  },
  {
    key: { parentPhone: 1 },
    name: "idx_parent_phone",
  },

  // Status and workflow
  {
    key: { status: 1 },
    name: "idx_booking_status",
  },
  {
    key: { status: 1, priority: 1 },
    name: "idx_status_priority",
  },
  {
    key: { assignedTo: 1, status: 1 },
    name: "idx_assignment_status",
  },

  // Service type queries
  {
    key: { serviceType: 1 },
    name: "idx_service_type",
  },
  {
    key: { serviceType: 1, status: 1 },
    name: "idx_service_status",
  },

  // Date-based queries
  {
    key: { createdAt: 1 },
    name: "idx_created_date",
  },
  {
    key: { "schedule.startDate": 1 },
    name: "idx_start_date",
  },
  {
    key: { "schedule.endDate": 1 },
    name: "idx_end_date",
  },
  {
    key: { followUpDate: 1, followUpRequired: 1 },
    name: "idx_follow_up",
  },

  // Payment tracking
  {
    key: { "payment.status": 1 },
    name: "idx_payment_status",
  },
  {
    key: { "payment.status": 1, "payment.method": 1 },
    name: "idx_payment_method_status",
  },
  {
    key: {
      "payment.installments.dueDate": 1,
      "payment.installments.status": 1,
    },
    name: "idx_installment_due",
  },

  // Revenue and analytics
  {
    key: { serviceType: 1, createdAt: 1, "pricing.totalAmount": 1 },
    name: "idx_revenue_analysis",
  },
  {
    key: { source: 1, createdAt: 1 },
    name: "idx_source_tracking",
  },

  // Customer relationship
  {
    key: { isRepeatedCustomer: 1, parentEmail: 1 },
    name: "idx_repeat_customers",
  },
  {
    key: { rating: 1, reviewDate: 1 },
    name: "idx_reviews",
  },

  // Compound indexes for common queries
  {
    key: { serviceType: 1, status: 1, createdAt: 1 },
    name: "idx_service_status_date",
  },
  {
    key: { userId: 1, status: 1, createdAt: -1 },
    name: "idx_user_status_recent",
  },
  {
    key: { assignedTo: 1, "schedule.startDate": 1, status: 1 },
    name: "idx_assignment_schedule",
  },

  // Text search index
  {
    key: {
      parentName: "text",
      parentEmail: "text",
      "children.name": "text",
    },
    name: "idx_booking_text_search",
  },
];

const BookingModel = { BookingSchema, BookingIndexes };
export default BookingModel;
