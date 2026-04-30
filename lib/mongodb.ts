import {
  MongoClient,
  ServerApiVersion,
  Db,
  Collection,
  Document,
} from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Extend the global type to include our MongoDB client promise
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI as string;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  // IMPORTANT: avoid connecting at module import time.
  // Next.js build can import route/model modules during "Collecting page data".
  if (!uri) {
    return Promise.reject(
      new Error("Please add your MONGODB_URI to .env.local")
    );
  }

  if (clientPromise) return clientPromise;

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable to preserve the connection
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
    return clientPromise;
  }

  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
  return clientPromise;
}

// Database name extracted from URI or default
const dbName = "parental-pal";

// Helper function to get database
export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

// Helper function to get collection
export async function getCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(collectionName);
}

// Default export is kept for backwards-compatibility with existing imports.
// Export the function (do not eagerly call) to avoid connecting during module import.
export default getClientPromise;
