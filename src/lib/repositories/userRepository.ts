// lib/repositories/userRepository.ts
import { db } from '../db';
import { users, orders, incidents, invoices } from '../schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface UserWithDetails {
  id: string;
  name: string;
  phoneNumber: string;
  orders: {
    orderId: string;
    productName: string;
    inServiceDate: string;
    outServiceDate: string | null; // Nullable if not set
    plan: string;
    status: string;
  }[];
  incidents: {
    incidentId: string;
    date: string;
    description: string;
    status: string;
  }[];
  invoices: {
    id: number;
    periodStartDate: string;
    periodEndDate: string;
    price: string;
    adjustment: string | null;
  }[];
}

export class UserRepository {
  // Get all users (basic info only)
  async getAllUsers() {
    return db.select({
      id: users.externalId,
      name: users.name,
      phoneNumber: users.phoneNumber,
    }).from(users);
  }

  // Get a user by their external ID with all details
  async getUserById(externalId: string): Promise<UserWithDetails | null> {
    // Get the user
    const userResults = await db.select().from(users).where(eq(users.externalId, externalId));
    
    if (userResults.length === 0) {
      return null;
    }
    
    const user = userResults[0];
    
    // Get the user's orders
    const userOrders = await db.select({
      orderId: orders.orderId,
      productName: orders.productName,
      inServiceDate: orders.inServiceDate,
      outServiceDate: orders.outServiceDate,
      plan: orders.plan,
      status: orders.status,
    }).from(orders).where(eq(orders.userId, user.id));
    
    // Get the user's incidents
    const userIncidents = await db.select({
      incidentId: incidents.incidentId,
      date: incidents.date,
      description: incidents.description,
      status: incidents.status,
    }).from(incidents).where(eq(incidents.userId, user.id));
    
    // Get the user's invoices
    const userInvoices = await db.select({
      id: invoices.id,
      periodStartDate: invoices.periodStartDate,
      periodEndDate: invoices.periodEndDate,
      price: invoices.price,
      adjustment: invoices.adjustment,
    }).from(invoices).where(eq(invoices.userId, user.id));
    
    // Format dates for frontend display
    const formattedOrders = userOrders.map(order => ({
      ...order,
      inServiceDate: order.inServiceDate ? new Date(order.inServiceDate).toISOString().split('T')[0] : '',
      outServiceDate: order.outServiceDate ? new Date(order.outServiceDate).toISOString().split('T')[0] : null,
    }));
    
    const formattedIncidents = userIncidents.map(incident => ({
      ...incident,
      date: new Date(incident.date).toISOString().split('T')[0]
    }));
    
    const formattedInvoices = userInvoices.map(invoice => ({
      ...invoice,
      periodStartDate: new Date(invoice.periodStartDate).toISOString().split('T')[0],
      periodEndDate: new Date(invoice.periodEndDate).toISOString().split('T')[0]
    }));
    
    // Return the user with their orders and incidents
    return {
      id: user.externalId,
      name: user.name,
      phoneNumber: user.phoneNumber,
      orders: formattedOrders,
      incidents: formattedIncidents,
      invoices: formattedInvoices,
    };
  }

  // Create a new user
  async createUser(name: string, email: string, phoneNumber: string) {
    const externalId = uuidv4();
    await db.insert(users).values({
      externalId,
      name,
      email, // Added email field
      phoneNumber,
    });
    return externalId;
  }

  // Add an order for a user
  async addOrder(userId: string, productName:string, plan: string, status: 'Active' | 'Expired' | 'Pending', inServiceDate: Date, outServiceDate?: Date) {
    // Get the internal user ID
    const userResults = await db.select().from(users).where(eq(users.externalId, userId));
    
    if (userResults.length === 0) {
      throw new Error('User not found');
    }
    
    const orderId = `ORD${Math.floor(1000 + Math.random() * 9000)}`;
    
    await db.insert(orders).values({
      orderId,
      userId: userResults[0].id,
      productName,
      date: new Date(), // Add the required 'date' field
      inServiceDate,
      outServiceDate: outServiceDate || null,
      plan,
      status,
    });
    
    return orderId;
  }

  // Add an incident for a user
  async addIncident(userId: string, description: string, status: 'Open' | 'Pending' | 'Resolved') {
    // Get the internal user ID
    const userResults = await db.select().from(users).where(eq(users.externalId, userId));
    
    if (userResults.length === 0) {
      throw new Error('User not found');
    }
    
    const incidentId = `INC${Math.floor(1000 + Math.random() * 9000)}`;
    
    await db.insert(incidents).values({
      incidentId,
      userId: userResults[0].id,
      date: new Date(),
      description,
      status,
    });
    
    return incidentId;
  }

  // Update an incident status
  async updateIncidentStatus(incidentId: string, status: 'Open' | 'Pending' | 'Resolved') {
    await db.update(incidents)
      .set({ status })
      .where(eq(incidents.incidentId, incidentId));
  }

  // Update an order status
  async updateOrderStatus(orderId: string, status: 'Active' | 'Expired' | 'Pending') {
    await db.update(orders)
      .set({ status })
      .where(eq(orders.orderId, orderId));
  }
}