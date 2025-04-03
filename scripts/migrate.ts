// scripts/migrate.ts
import { runMigrations } from '@/lib/db';
import { UserRepository } from '@/lib/repositories/userRepository';

async function seed() {
  const userRepo = new UserRepository();
  
  try {
    // Run migrations first
    await runMigrations();
    console.log('Migrations completed');
    
    // Create test users
    const johnId = await userRepo.createUser('John Doe', '0612345678');
    console.log(`Created user John Doe with ID: ${johnId}`);
    
    const janeId = await userRepo.createUser('Jane Smith', '0698765432');
    console.log(`Created user Jane Smith with ID: ${janeId}`);
    
    // Add orders for John
    await userRepo.addOrder(johnId, 'Unlimited 5G', 'Active');
    await userRepo.addOrder(johnId, 'Basic 4G', 'Expired');
    
    // Add orders for Jane
    await userRepo.addOrder(janeId, 'Family Plan 10GB', 'Active');
    
    // Add incidents for John
    await userRepo.addIncident(johnId, 'No network coverage in Amsterdam', 'Resolved');
    await userRepo.addIncident(johnId, 'Overcharged on last bill', 'Pending');
    await userRepo.addIncident(johnId, 'SIM card not delivered', 'Open');
    
    // Add incidents for Jane
    await userRepo.addIncident(janeId, 'Slow internet speed at home', 'Open');
    await userRepo.addIncident(janeId, 'Unable to make international calls', 'Open');
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during migration/seeding:', error);
  }
}

// Run the migration and seeding
seed().catch(console.error);