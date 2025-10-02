// Export native MongoDB model interfaces and schemas
export type { UserInterface } from "./User";
export type { BookingInterface } from "./Booking";  
export type { ServiceInterface } from "./Service";

// Export schemas
export { UserSchema } from "./User";
export { BookingSchema } from "./Booking";
export { ServiceSchema } from "./Service";

// Export model objects
export { default as UserModel } from "./User";
export { default as BookingModel } from "./Booking";
export { default as ServiceModel } from "./Service";

// Database connection utilities
export { default as mongodbConnection } from "../lib/mongodb";

// Repository classes
export { default as UserRepository } from "../lib/UserRepository";
export { default as BookingRepository } from "../lib/BookingRepository";