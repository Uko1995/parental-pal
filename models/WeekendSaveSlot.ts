import { ObjectId } from "mongodb";

export interface WeekendSaveSlotInterface {
  _id?: ObjectId;
  parentName: string;
  parentEmail: string;
  childName: string;
  childAge: string;
  createdAt: Date;
}

export const WeekendSaveSlotSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "parentName",
        "parentEmail",
        "childName",
        "childAge",
        "createdAt",
      ],
      properties: {
        _id: { bsonType: "objectId" },
        parentName: { bsonType: "string", minLength: 2, maxLength: 100 },
        parentEmail: {
          bsonType: "string",
          pattern: "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$",
          maxLength: 255,
        },
        childName: { bsonType: "string", minLength: 1, maxLength: 80 },
        childAge: { bsonType: "string", maxLength: 20 },
        createdAt: { bsonType: "date" },
      },
    },
  },
};

export const WeekendSaveSlotIndexes = [
  { key: { createdAt: -1 }, name: "idx_created_at" },
  { key: { parentEmail: 1 }, name: "idx_parent_email" },
];

export const WeekendSaveSlotModel = {
  collectionName: "weekend_save_slots",
  schema: WeekendSaveSlotSchema,
  indexes: WeekendSaveSlotIndexes,
};

export default WeekendSaveSlotModel;
