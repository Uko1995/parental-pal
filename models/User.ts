import { ObjectId } from "mongodb";

// TypeScript interface for User document
export interface UserInterface {
  _id?: ObjectId;
  userData: {
    expiresAt: string;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  phone?: string;
  address?: string;
  image?: string;
  googleId?: string; // For Google OAuth
  password?: string; // For email/password authentication
  role: "admin" | "parent" | "tutor";
  isActive: boolean;
  lastLoginAt?: Date;
  membershipType: "basic" | "premium" | "none";

  // Parent-specific fields
  children?: {
    name: string;
    age: number;
    gender: "male" | "female";
    class?: string;
    schoolName?: string;
    subjects?: string[];
  }[];

  // Tutor-specific fields
  tutorProfile?: {
    specialty: string;
    experience: number;
    qualifications?: string[];
    subjects?: string[];
    rating: number;
    totalReviews: number;
    availability: {
      days: (
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday"
      )[];
      hours: {
        start: string; // HH:MM format
        end: string; // HH:MM format
      };
    };
    hourlyRate?: number;
    hourlyRateAccepted?: boolean;
    bio?: string;
    isVerified: boolean;
  };

  // User preferences
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    preferredServices: (
      | "childcare"
      | "tutoring"
      | "homeschooling"
      | "holiday-camps"
      | "space-rental"
      | "kiddies-enrichment"
    )[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

// MongoDB Schema Validator
export const UserSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "userData",
        "role",
        "isActive",
        "membershipType",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        userData: {
          bsonType: "object",
          required: ["expiresAt", "user"],
          properties: {
            expiresAt: {
              bsonType: "string",
              description: "Expiration date of user session",
            },
            user: {
              bsonType: "object",
              required: ["name", "email", "image"],
              properties: {
                name: {
                  bsonType: "string",
                  minLength: 1,
                  maxLength: 100,
                  description: "User's full name",
                },
                email: {
                  bsonType: "string",
                  pattern: "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$",
                  description: "User's email address",
                },
                image: {
                  bsonType: "string",
                  pattern: "^https?://.*",
                  description: "Profile image URL",
                },
              },
            },
          },
        },
        phone: {
          bsonType: ["string", "null"],
          pattern: "^[\\+]?[0-9\\s\\-\\(\\)]+$",
          description: "User's phone number",
        },
        address: {
          bsonType: ["string", "null"],
          maxLength: 500,
          description: "User's address",
        },
        image: {
          bsonType: ["string", "null"],
          pattern: "^https?://.*",
          description: "Profile image URL",
        },

        googleId: {
          bsonType: ["string", "null"],
          description: "Google OAuth ID",
        },

        role: {
          bsonType: "string",
          enum: ["admin", "parent", "tutor"],
          description: "User's role in the system",
        },
        isActive: {
          bsonType: "bool",
          description: "Whether the user account is active",
        },
        lastLoginAt: {
          bsonType: ["date", "null"],
          description: "Last login timestamp",
        },
        membershipType: {
          bsonType: "string",
          enum: ["basic", "premium", "none"],
          description: "User's membership level only for parents",
        },
        children: {
          bsonType: ["array", "null"],
          items: {
            bsonType: "object",
            required: ["name", "age", "gender"],
            properties: {
              name: {
                bsonType: "string",
                minLength: 1,
                maxLength: 100,
                description: "Child's name",
              },
              age: {
                bsonType: "number",
                minimum: 0,
                maximum: 18,
                description: "Child's age",
              },
              gender: {
                bsonType: "string",
                enum: ["male", "female"],
                description: "Child's gender",
              },
              class: {
                bsonType: ["string", "null"],
                maxLength: 50,
                description: "Child's school class",
              },
              schoolName: {
                bsonType: ["string", "null"],
                maxLength: 200,
                description: "Child's school name",
              },
              subjects: {
                bsonType: ["array", "null"],
                items: {
                  bsonType: "string",
                  maxLength: 50,
                },
                description: "Subjects child needs help with",
              },
            },
          },
          description: "Parent's children information",
        },
        tutorProfile: {
          bsonType: ["object", "null"],
          required: [
            "specialty",
            "experience",
            "rating",
            "totalReviews",
            "availability",
            "isVerified",
          ],
          properties: {
            specialty: {
              bsonType: "string",
              minLength: 1,
              maxLength: 100,
              description: "Tutor's area of specialty",
            },
            experience: {
              bsonType: "number",
              minimum: 0,
              maximum: 50,
              description: "Years of experience",
            },
            qualifications: {
              bsonType: "array",
              items: {
                bsonType: "string",
                maxLength: 200,
              },
              description: "Educational qualifications",
            },
            subjects: {
              bsonType: ["array", "null"],
              items: {
                bsonType: "string",
                maxLength: 50,
              },
              description: "Subjects tutor can teach",
            },
            rating: {
              bsonType: "number",
              minimum: 0,
              maximum: 5,
              description: "Average rating",
            },
            totalReviews: {
              bsonType: "number",
              minimum: 0,
              description: "Total number of reviews",
            },
            availability: {
              bsonType: "object",
              required: ["days", "hours"],
              properties: {
                days: {
                  bsonType: "array",
                  items: {
                    bsonType: "string",
                    enum: [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ],
                  },
                  description: "Available days of the week",
                },
                hours: {
                  bsonType: "object",
                  required: ["start", "end"],
                  properties: {
                    start: {
                      bsonType: "string",
                      pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
                      description: "Start time in HH:MM format",
                    },
                    end: {
                      bsonType: "string",
                      pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
                      description: "End time in HH:MM format",
                    },
                  },
                },
              },
            },
            hourlyRate: {
              bsonType: ["number", "null"],
              minimum: 0,
              maximum: 100000,
              description: "Hourly tutoring rate",
            },
            hourlyRateAccepted: {
              bsonType: ["bool", "null"],
              description: "Whether tutor accepts the hourly rate offer",
            },
            bio: {
              bsonType: ["string", "null"],
              maxLength: 1000,
              description: "Tutor's biography",
            },
            isVerified: {
              bsonType: "bool",
              description: "Whether tutor is verified",
            },
          },
          description: "Tutor-specific profile information",
        },
        preferences: {
          bsonType: ["object", "null"],
          properties: {
            notifications: {
              bsonType: "object",
              properties: {
                email: {
                  bsonType: "bool",
                  description: "Email notifications enabled",
                },
                sms: {
                  bsonType: "bool",
                  description: "SMS notifications enabled",
                },
                push: {
                  bsonType: "bool",
                  description: "Push notifications enabled",
                },
              },
            },
            preferredServices: {
              bsonType: "array",
              items: {
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
              description: "User's preferred services",
            },
            emergencyContact: {
              bsonType: ["object", "null"],
              properties: {
                name: {
                  bsonType: "string",
                  maxLength: 100,
                  description: "Emergency contact name",
                },
                phone: {
                  bsonType: "string",
                  maxLength: 20,
                  description: "Emergency contact phone",
                },
                relationship: {
                  bsonType: "string",
                  maxLength: 50,
                  description: "Relationship to user",
                },
              },
            },
          },
          description: "User preferences and settings",
        },
        createdAt: {
          bsonType: "date",
          description: "Account creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp",
        },
      },
    },
  },
};

// Index definitions for performance optimization
export const UserIndexes = [
  // Unique indexes
  { key: { email: 1 }, unique: true, name: "email_unique" },
  { key: { googleId: 1 }, unique: true, sparse: true, name: "googleId_unique" },

  // Query optimization indexes
  { key: { role: 1 }, name: "role_index" },
  { key: { isActive: 1 }, name: "isActive_index" },
  { key: { membershipType: 1 }, name: "membershipType_index" },
  { key: { emailVerified: 1 }, name: "emailVerified_index" },
  { key: { lastLoginAt: -1 }, name: "lastLoginAt_desc" },
  { key: { createdAt: -1 }, name: "createdAt_desc" },

  // Tutor-specific indexes
  { key: { "tutorProfile.specialty": 1 }, name: "tutor_specialty_index" },
  { key: { "tutorProfile.subjects": 1 }, name: "tutor_subjects_index" },
  { key: { "tutorProfile.rating": -1 }, name: "tutor_rating_desc" },
  { key: { "tutorProfile.isVerified": 1 }, name: "tutor_verified_index" },
  {
    key: { "tutorProfile.availability.days": 1 },
    name: "tutor_availability_days",
  },

  // Compound indexes for common queries
  { key: { role: 1, isActive: 1 }, name: "role_active_compound" },
  {
    key: { role: 1, "tutorProfile.specialty": 1 },
    name: "tutor_role_specialty",
  },
  { key: { role: 1, "tutorProfile.rating": -1 }, name: "tutor_role_rating" },
  {
    key: { membershipType: 1, isActive: 1 },
    name: "membership_active_compound",
  },

  // Text search index for names and bios
  {
    key: { name: "text", "tutorProfile.bio": "text" },
    name: "text_search_index",
  },
];

const UserModel = { UserSchema, UserIndexes };
export default UserModel;
