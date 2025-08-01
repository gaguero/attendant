import { PrismaClient } from '@prisma/client';
import { DashboardService } from './src/services/dashboard.service.js';

const prisma = new PrismaClient();
const dashboardService = new DashboardService(prisma);

async function testDashboard() {
  try {
    console.log('Testing dashboard service...');
    
    // Test basic database queries
    console.log('Testing basic queries...');
    const [guests, users, vendors] = await Promise.all([
      prisma.guest.count(),
      prisma.user.count(),
      prisma.vendor.count()
    ]);
    
    console.log('Counts:', { guests, users, vendors });
    
    // Test metrics
    console.log('Testing metrics...');
    const metrics = await dashboardService.getMetrics();
    console.log('Metrics:', metrics);
    
    console.log('✅ Dashboard test completed successfully!');
  } catch (error) {
    console.error('❌ Dashboard test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboard(); 