// backend/seeders/seedReturnRisks.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './models/Customer.js';
import ReturnRisk from './models/ReturnRisk.js';

dotenv.config({ path: './.env' });

const calculateRiskScore = (totalOrders, totalReturns) => {
  if (totalOrders === 0) return 0;
  const returnRate = (totalReturns / totalOrders) * 100;
  return Math.min(Math.round(returnRate), 100);
};

const getRiskLevelString = (score) => {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

const seedReturnRisks = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("MongoDB connected for seeding return risks.");

    await ReturnRisk.deleteMany();
    console.log("Existing return risks cleared.");

    const customers = await Customer.find({});
    if (customers.length === 0) {
      console.warn("No customers found. Please run seedCustomers.js first.");
      process.exit(1);
    }

    const returnRisksToCreate = [];

    for (const customer of customers) {
      const riskScore = calculateRiskScore(customer.totalOrders, customer.totalReturns);
      const riskLevel = getRiskLevelString(riskScore);

      let factors = new Map();
      let recommendations = [];

      if (riskLevel === 'High' || riskLevel === 'Critical') {
        factors.set('highReturnRate', 1);
        if (customer.totalReturns > 10) factors.set('frequentReturns', 1);
        if (riskScore > 90) factors.set('veryHighScore', 1);

        recommendations.push('Review recent return reasons');
        recommendations.push('Consider offering alternative products');
        if (riskLevel === 'Critical') {
          recommendations.push('Flag for manual review by fraud team');
          factors.set('potentialAbuse', 1);
        }
      } else if (riskLevel === 'Medium') {
        factors.set('moderateReturnRate', 1);
        recommendations.push('Monitor future return behavior');
      } else {
        factors.set('lowReturnRate', 1);
        recommendations.push('No immediate action required');
      }

      const newReturnRisk = new ReturnRisk({
        customer: customer._id,
        riskScore: riskScore,
        riskLevel: riskLevel,
        factors: factors,
        recommendations: recommendations,
        analysisDate: new Date(),
      });

      returnRisksToCreate.push(newReturnRisk);
    }

    const createdReturnRisks = await ReturnRisk.insertMany(returnRisksToCreate);
    console.log(`✅ ${createdReturnRisks.length} Return Risks seeded successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding return risks:", err);
    process.exit(1);
  }
};

seedReturnRisks();
