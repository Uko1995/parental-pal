import { MongoClient, ServerApiVersion, Db, Collection, Document } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Extend the global type to include our MongoDB client promise
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Database name extracted from URI or default
const dbName = 'parental-pal';

// Helper function to get database
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

// Helper function to get collection
export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(collectionName);
}

export default clientPromise;
