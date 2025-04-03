// lib/schema.ts
import { pgTable, serial, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Create enums for statuses
export const orderStatusEnum = pgEnum('order_status', ['Active', 'Expired', 'Pending']);
export const incidentStatusEnum = pgEnum('incident_status', ['Open', 'Pending', 'Resolved']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  externalId: varchar('external_id', { length: 36 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 36 }).notNull().unique(),
  userId: serial('user_id').references(() => users.id).notNull(),
  date: timestamp('date').notNull(),
  plan: varchar('plan', { length: 255 }).notNull(),
  status: orderStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Incidents table
export const incidents = pgTable('incidents', {
  id: serial('id').primaryKey(),
  incidentId: varchar('incident_id', { length: 36 }).notNull().unique(),
  userId: serial('user_id').references(() => users.id).notNull(),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  status: incidentStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// // Example data for users
// const usersData = [
//   {
//     externalId: "uuid-1234", // Add externalId
//     name: "John Doe",
//     phoneNumber: "0612345678",
//     createdAt: new Date(), // Optional, defaults to now
//   },
// ];

// // Example data for orders
// const ordersData = [
//   {
//     orderId: "order-1234", // Add orderId
//     userId: 1, // Reference to a user
//     date: new Date(), // Add date
//     plan: "Unlimited 5G",
//     status: "Active", // Must match the enum
//     createdAt: new Date(), // Optional, defaults to now
//   },
// ];

// // Example data for incidents
// const incidentsData = [
//   {
//     incidentId: "incident-1234", // Add incidentId
//     userId: 1, // Reference to a user
//     date: new Date(), // Add date
//     description: "No network coverage in Amsterdam",
//     status: "Resolved", // Must match the enum
//     createdAt: new Date(), // Optional, defaults to now
//   },
// ];