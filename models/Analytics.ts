import { ObjectId } from "mongodb";

// TypeScript interface for Analytics Event document
export interface AnalyticsEventInterface {
  _id?: ObjectId;
  eventType:
    | "page_view"
    | "signup"
    | "login"
    | "booking"
    | "payment"
    | "click"
    | "form_submit"
    | "custom";
  eventName: string;
  userId?: ObjectId;
  sessionId: string;
  path: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  duration?: number; // For page views - time spent on page
  createdAt: Date;
  updatedAt: Date;
}

// TypeScript interface for Analytics Session document
export interface AnalyticsSessionInterface {
  _id?: ObjectId;
  sessionId: string;
  userId?: ObjectId;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  events: number;
  referrer?: string;
  userAgent?: string;
  deviceType?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB Schema Validator for Analytics Events
export const AnalyticsEventSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "eventType",
        "eventName",
        "sessionId",
        "path",
        "timestamp",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        eventType: {
          enum: [
            "page_view",
            "signup",
            "login",
            "booking",
            "payment",
            "click",
            "form_submit",
            "custom",
          ],
          description: "Type of analytics event",
        },
        eventName: {
          bsonType: "string",
          description: "Human-readable event name",
        },
        userId: {
          bsonType: "objectId",
          description: "Optional user ID if logged in",
        },
        sessionId: {
          bsonType: "string",
          description: "Unique session identifier",
        },
        path: {
          bsonType: "string",
          description: "URL path where event occurred",
        },
        referrer: {
          bsonType: "string",
          description: "Referrer URL",
        },
        userAgent: {
          bsonType: "string",
          description: "Browser user agent string",
        },
        deviceType: {
          enum: ["mobile", "tablet", "desktop"],
          description: "Device type",
        },
        browser: {
          bsonType: "string",
          description: "Browser name",
        },
        os: {
          bsonType: "string",
          description: "Operating system",
        },
        country: {
          bsonType: "string",
          description: "Country from IP",
        },
        city: {
          bsonType: "string",
          description: "City from IP",
        },
        ip: {
          bsonType: "string",
          description: "IP address",
        },
        metadata: {
          bsonType: "object",
          description: "Additional custom metadata",
        },
        timestamp: {
          bsonType: "date",
          description: "Event timestamp",
        },
        duration: {
          bsonType: "number",
          description: "Duration in milliseconds (for page views)",
        },
        createdAt: {
          bsonType: "date",
          description: "Record creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Record update timestamp",
        },
      },
    },
  },
};

// MongoDB Schema Validator for Analytics Sessions
export const AnalyticsSessionSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "sessionId",
        "startTime",
        "pageViews",
        "events",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        sessionId: {
          bsonType: "string",
          description: "Unique session identifier",
        },
        userId: {
          bsonType: "objectId",
          description: "Optional user ID if logged in",
        },
        startTime: {
          bsonType: "date",
          description: "Session start time",
        },
        endTime: {
          bsonType: "date",
          description: "Session end time",
        },
        pageViews: {
          bsonType: "int",
          minimum: 0,
          description: "Total page views in session",
        },
        events: {
          bsonType: "int",
          minimum: 0,
          description: "Total events in session",
        },
        referrer: {
          bsonType: "string",
          description: "Initial referrer URL",
        },
        userAgent: {
          bsonType: "string",
          description: "Browser user agent string",
        },
        deviceType: {
          enum: ["mobile", "tablet", "desktop"],
          description: "Device type",
        },
        browser: {
          bsonType: "string",
          description: "Browser name",
        },
        os: {
          bsonType: "string",
          description: "Operating system",
        },
        country: {
          bsonType: "string",
          description: "Country from IP",
        },
        city: {
          bsonType: "string",
          description: "City from IP",
        },
        ip: {
          bsonType: "string",
          description: "IP address",
        },
        createdAt: {
          bsonType: "date",
          description: "Record creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Record update timestamp",
        },
      },
    },
  },
};

// Indexes for Analytics Events
export const AnalyticsEventIndexes = [
  { key: { timestamp: -1 }, name: "timestamp_desc" },
  { key: { eventType: 1, timestamp: -1 }, name: "eventType_timestamp" },
  { key: { userId: 1, timestamp: -1 }, name: "userId_timestamp" },
  { key: { path: 1, timestamp: -1 }, name: "path_timestamp" },
  { key: { sessionId: 1 }, name: "sessionId" },
];

// Indexes for Analytics Sessions
export const AnalyticsSessionIndexes = [
  { key: { sessionId: 1 }, name: "sessionId_unique", unique: true },
  { key: { startTime: -1 }, name: "startTime_desc" },
  { key: { userId: 1, startTime: -1 }, name: "userId_startTime" },
];
