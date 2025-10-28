import { ObjectId } from "mongodb";

// TypeScript interface for Service
export interface ServiceInterface {
  _id?: ObjectId;
  name: string;
  type:
    | "childcare"
    | "tutoring"
    | "homeschooling"
    | "holiday-camps"
    | "space-rental"
    | "kiddies-enrichment";

  // Service description and details
  description: string;
  shortDescription: string;
  image: string;

  // Pricing structure
  pricing: {
    baseRate: string;
    currency: string;
    billingType:
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "term"
      | "per-event"
      | "custom";

    // Package deals and discounts
    packages?: Array<{
      name: string;
      description: string;
      duration: string; // e.g., "1 month", "3 months"
      discountPercentage: number;
      minimumSessions?: number;
    }>;
  };

  // Key features
  keyFeatures?: string[];

  // Service-specific requirements and constraints
  requirements?: {
    // Age requirements
    minimumAge?: number;
    maximumAge?: number;
    ageGroups?: string[]; // e.g., ["toddler", "preschool", "primary"]

    // Group size
    minimumParticipants: number;
    maximumParticipants: number;
    idealGroupSize?: number;

    // Location requirements
    venueTypes?: Array<"indoor" | "outdoor" | "both">;
    equipmentProvided?: string[];
    spaceRequirements?: string;
  };
  availability: string[];

  // Business logic
  status: "active" | "inactive" | "draft" | "seasonal" | "discontinued";

  // Performance metrics
  metrics?: {
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    conversionRate: number; // inquiries to bookings
    repeatCustomerRate: number;

    // Monthly statistics
    monthlyStats?: Array<{
      month: string;
      year: number;
      bookings: number;
      revenue: number;
      avgRating: number;
    }>;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastBookedAt?: Date;

  // Integration and automation
  integrations?: {
    calendarSync: boolean;
    autoAssignment: boolean;
    paymentGateway: string[];
    crmIntegration?: string;
  };
}

// MongoDB schema validation
export const ServiceSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "name",
        "type",
        "description",
        "pricing",
        "availability",
        "status",
        "createdAt",
        "updatedAt",
        "image",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        name: {
          bsonType: "string",
          minLength: 3,
          maxLength: 100,
        },
        type: {
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

        description: {
          bsonType: "string",
          minLength: 50,
          maxLength: 2000,
        },
        shortDescription: {
          bsonType: "string",
          maxLength: 200,
        },

        // Pricing validation
        pricing: {
          bsonType: "object",
          required: ["baseRate", "currency", "billingType"],
          properties: {
            baseRate: { bsonType: "number", minimum: 0 },
            currency: {
              bsonType: "string",
              enum: ["NGN", "USD", "EUR", "GBP"],
            },
            billingType: {
              bsonType: "string",
              enum: [
                "hourly",
                "daily",
                "weekly",
                "monthly",
                "per-event",
                "custom",
              ],
            },

            packages: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: [
                  "name",
                  "description",
                  "duration",
                  "discountPercentage",
                ],
                properties: {
                  name: { bsonType: "string" },
                  description: { bsonType: "string" },
                  duration: { bsonType: "string" },
                  discountPercentage: {
                    bsonType: "number",
                    minimum: 0,
                    maximum: 100,
                  },
                  minimumSessions: { bsonType: "int", minimum: 1 },
                },
              },
            },
            additionalFees: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["name", "amount", "required", "recurring"],
                properties: {
                  name: { bsonType: "string" },
                  amount: { bsonType: "number", minimum: 0 },
                  required: { bsonType: "bool" },
                  recurring: { bsonType: "bool" },
                },
              },
            },
          },
        },
        keyFeatures: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
        },

        // Status and business logic
        status: {
          bsonType: "string",
          enum: ["active", "inactive", "draft", "seasonal", "discontinued"],
        },
        priority: { bsonType: "int", minimum: 1, maximum: 100 },
        featured: { bsonType: "bool" },
        popular: { bsonType: "bool" },

        // Metrics validation
        metrics: {
          bsonType: "object",
          required: [
            "totalBookings",
            "totalRevenue",
            "averageRating",
            "totalReviews",
            "conversionRate",
            "repeatCustomerRate",
          ],
          properties: {
            totalBookings: { bsonType: "int", minimum: 0 },
            totalRevenue: { bsonType: "number", minimum: 0 },
            averageRating: { bsonType: "number", minimum: 0, maximum: 5 },
            totalReviews: { bsonType: "int", minimum: 0 },
            conversionRate: { bsonType: "number", minimum: 0, maximum: 100 },
            repeatCustomerRate: {
              bsonType: "number",
              minimum: 0,
              maximum: 100,
            },
            monthlyStats: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["month", "year", "bookings", "revenue", "avgRating"],
                properties: {
                  month: { bsonType: "string" },
                  year: { bsonType: "int", minimum: 2020 },
                  bookings: { bsonType: "int", minimum: 0 },
                  revenue: { bsonType: "number", minimum: 0 },
                  avgRating: { bsonType: "number", minimum: 0, maximum: 5 },
                },
              },
            },
          },
        },
        availability: {
          bsonType: "array",
          items: "string",
          description:
            "available periods eg. weekdays, weekends, school breaks etc",
        },

        // Administrative fields
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        lastBookedAt: { bsonType: "date" },
        image: { bsonType: "string" },

        // Integration settings
        integrations: {
          bsonType: "object",
          properties: {
            calendarSync: { bsonType: "bool" },
            autoAssignment: { bsonType: "bool" },
            paymentGateway: {
              bsonType: "array",
              items: { bsonType: "string" },
            },
            crmIntegration: { bsonType: "string" },
          },
        },
      },
    },
  },
};

// Indexes for optimal performance
export const ServiceIndexes = [
  // Primary lookups
  {
    key: { name: 1 },
    name: "idx_service_name",
  },
  {
    key: { type: 1 },
    name: "idx_service_type",
  },

  {
    key: { status: 1 },
    name: "idx_service_status",
  },

  // Business logic indexes
  {
    key: { status: 1, featured: 1 },
    name: "idx_active_featured",
  },
  {
    key: { status: 1, popular: 1 },
    name: "idx_active_popular",
  },
  {
    key: { priority: 1, status: 1 },
    name: "idx_priority_status",
  },

  // Performance and analytics
  {
    key: { "metrics.totalBookings": -1 },
    name: "idx_total_bookings",
  },
  {
    key: { "metrics.averageRating": -1 },
    name: "idx_average_rating",
  },
  {
    key: { "metrics.totalRevenue": -1 },
    name: "idx_total_revenue",
  },
  {
    key: { lastBookedAt: -1 },
    name: "idx_last_booked",
  },

  // Pricing and availability
  {
    key: { "pricing.baseRate": 1 },
    name: "idx_base_rate",
  },
  {
    key: { "pricing.billingType": 1 },
    name: "idx_billing_type",
  },
  {
    key: { "availability.days.day": 1, "availability.days.available": 1 },
    name: "idx_availability",
  },

  // Administrative

  {
    key: { createdAt: 1 },
    name: "idx_created_date",
  },
  {
    key: { updatedAt: 1 },
    name: "idx_updated_date",
  },

  // Compound indexes for common queries
  {
    key: { type: 1, status: 1, priority: 1 },
    name: "idx_type_status_priority",
  },
  {
    key: { category: 1, status: 1, "metrics.averageRating": -1 },
    name: "idx_category_status_rating",
  },
  {
    key: { status: 1, "pricing.billingType": 1, "pricing.baseRate": 1 },
    name: "idx_status_billing_rate",
  },

  // Text search index
  {
    key: {
      name: "text",
      description: "text",
      shortDescription: "text",
    },
    name: "idx_service_text_search",
  },
];

const ServiceModel = { ServiceSchema, ServiceIndexes };
export default ServiceModel;
