// Export native MongoDB model interfaces and schemas
export type { UserInterface } from "./User";
export type { BookingInterface } from "./Booking";
export type { ServiceInterface } from "./Service";
export type { ProductInterface } from "./Product";
export type { OrderInterface } from "./Order";

// Export schemas
export { UserSchema } from "./User";
export { BookingSchema } from "./Booking";
export { ServiceSchema } from "./Service";
export { ProductSchema } from "./Product";
export { OrderSchema } from "./Order";

// Export model objects
export { default as UserModel } from "./User";
export { default as BookingModel } from "./Booking";
export { default as ServiceModel } from "./Service";
export { default as ProductModel } from "./Product";
export { default as OrderModel } from "./Order";

// Database connection utilities
export { default as mongodbConnection } from "../lib/mongodb";

// Repository classes
export { default as UserRepository } from "../lib/UserRepository";
export { default as BookingRepository } from "../lib/BookingRepository";
export { default as ProductRepository } from "../lib/ProductRepository";
export { default as OrderRepository } from "../lib/OrderRepository";
