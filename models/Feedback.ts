import { ObjectId } from "mongodb";

export type InterestLevel =
  | "very-interested"
  | "somewhat-interested"
  | "just-exploring";

export interface FeedbackInterface {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  childAgeRange: string;
  servicesInterested: string[];
  customService?: string;
  interestLevel: InterestLevel;
  feedback?: string;
  consent: boolean;
  createdAt: Date;
}

export const FeedbackSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "name",
        "email",
        "phone",
        "childAgeRange",
        "servicesInterested",
        "interestLevel",
        "consent",
        "createdAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        name: {
          bsonType: "string",
          maxLength: 120,
        },
        email: {
          bsonType: "string",
          maxLength: 200,
        },
        phone: {
          bsonType: "string",
          maxLength: 40,
        },
        childAgeRange: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50,
        },
        servicesInterested: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "string",
          },
        },
        customService: {
          bsonType: "string",
          maxLength: 200,
        },
        interestLevel: {
          enum: ["very-interested", "somewhat-interested", "just-exploring"],
        },
        feedback: {
          bsonType: "string",
          maxLength: 3000,
        },
        consent: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
      },
    },
  },
};

const FeedbackModel = {
  collectionName: "feedback",
  schema: FeedbackSchema,
};

export default FeedbackModel;
