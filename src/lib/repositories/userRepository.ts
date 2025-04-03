// lib/repositories/userRepository.ts
import { db } from '../db';
import { users, orders, incidents } from '../schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface UserWithDetails {
  id: string;
  name: string;
  phoneNumber: string;
  orders: {
    orderId: string;
    date: string;
    plan: string;
    status: string;
  }[];
  incidents: {
    incidentId: string;
    date: string;
    description: string;
    status: string;
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
      date: orders.date,
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
    
    // Format dates for frontend display
    const formattedOrders = userOrders.map(order => ({
      ...order,
      date: new Date(order.date).toISOString().split('T')[0]
    }));
    
    const formattedIncidents = userIncidents.map(incident => ({
      ...incident,
      date: new Date(incident.date).toISOString().split('T')[0]
    }));
    
    // Return the user with their orders and incidents
    return {
      id: user.externalId,
      name: user.name,
      phoneNumber: user.phoneNumber,
      orders: formattedOrders,
      incidents: formattedIncidents,
    };
  }

  // Create a new user
  async createUser(name: string, phoneNumber: string) {
    const externalId = uuidv4();
    await db.insert(users).values({
      externalId,
      name,
      phoneNumber,
    });
    return externalId;
  }

  // Add an order for a user
  async addOrder(userId: string, plan: string, status: 'Active' | 'Expired' | 'Pending') {
    // Get the internal user ID
    const userResults = await db.select().from(users).where(eq(users.externalId, userId));
    
    if (userResults.length === 0) {
      throw new Error('User not found');
    }
    
    const orderId = `ORD${Math.floor(1000 + Math.random() * 9000)}`;
    
    await db.insert(orders).values({
      orderId,
      userId: userResults[0].id,
      date: new Date(),
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