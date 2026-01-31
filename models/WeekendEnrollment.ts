import { ObjectId } from "mongodb";

export interface WeekendEnrollmentInterface {
  _id?: ObjectId;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  children: Array<{ name: string; age: string }>;
  programId: string;
  programName: string;
  startDate: string;
  amount: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "failed";
  paystackReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const WeekendEnrollmentSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "parentName",
        "parentEmail",
        "parentPhone",
        "children",
        "programId",
        "programName",
        "startDate",
        "amount",
        "currency",
        "paymentStatus",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        parentName: { bsonType: "string", minLength: 2, maxLength: 100 },
        parentEmail: {
          bsonType: "string",
          pattern: "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$",
          maxLength: 255,
        },
        parentPhone: { bsonType: "string", minLength: 10, maxLength: 20 },
        children: {
          bsonType: "array",
          minItems: 1,
          maxItems: 10,
          items: {
            bsonType: "object",
            required: ["name", "age"],
            properties: {
              name: { bsonType: "string", minLength: 1, maxLength: 80 },
              age: { bsonType: "string", maxLength: 20 },
            },
          },
        },
        programId: { bsonType: "string", minLength: 1, maxLength: 80 },
        programName: { bsonType: "string", minLength: 1, maxLength: 200 },
        startDate: { bsonType: "string", minLength: 1, maxLength: 30 },
        amount: { bsonType: "number", minimum: 0 },
        currency: { bsonType: "string", enum: ["NGN", "USD"] },
        paymentStatus: {
          bsonType: "string",
          enum: ["pending", "paid", "failed"],
        },
        paystackReference: { bsonType: "string", maxLength: 100 },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};

export const WeekendEnrollmentIndexes = [
  { key: { createdAt: -1 }, name: "idx_created_at" },
  { key: { parentEmail: 1 }, name: "idx_parent_email" },
  { key: { paymentStatus: 1 }, name: "idx_payment_status" },
  { key: { startDate: 1 }, name: "idx_start_date" },
];

export const WeekendEnrollmentModel = {
  collectionName: "weekend_enrollments",
  schema: WeekendEnrollmentSchema,
  indexes: WeekendEnrollmentIndexes,
};

export default WeekendEnrollmentModel;
