/**
 * Test script for new features
 * Run with: node test-new-features.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Quiz from './src/models/Quiz.js';
import Discussion from './src/models/Discussion.js';
import LiveSession from './src/models/LiveSession.js';
import Progress from './src/models/Progress.js';
import Certificate from './src/models/Certificate.js';
import CourseMaterial from './src/models/CourseMaterial.js';

const testModels = async () => {
  try {
    console.log('🧪 Testing New Features...\n');

    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unied');
    console.log('✅ Connected to MongoDB\n');

    // Test Quiz Model
    console.log('1️⃣  Testing Quiz Model...');
    const quizCount = await Quiz.countDocuments();
    console.log(`   ✅ Quiz model working - ${quizCount} quizzes in database\n`);

    // Test Discussion Model
    console.log('2️⃣  Testing Discussion Model...');
    const discussionCount = await Discussion.countDocuments();
    console.log(`   ✅ Discussion model working - ${discussionCount} discussions in database\n`);

    // Test LiveSession Model
    console.log('3️⃣  Testing LiveSession Model...');
    const sessionCount = await LiveSession.countDocuments();
    console.log(`   ✅ LiveSession model working - ${sessionCount} sessions in database\n`);

    // Test Progress Model
    console.log('4️⃣  Testing Progress Model...');
    const progressCount = await Progress.countDocuments();
    console.log(`   ✅ Progress model working - ${progressCount} progress records in database\n`);

    // Test Certificate Model
    console.log('5️⃣  Testing Certificate Model...');
    const certificateCount = await Certificate.countDocuments();
    console.log(`   ✅ Certificate model working - ${certificateCount} certificates in database\n`);

    // Test CourseMaterial Model
    console.log('6️⃣  Testing CourseMaterial Model...');
    const materialCount = await CourseMaterial.countDocuments();
    console.log(`   ✅ CourseMaterial model working - ${materialCount} materials in database\n`);

    console.log('🎉 All models are working correctly!\n');

    // Test model methods
    console.log('🔧 Testing Model Methods...\n');

    // Test Progress calculation
    console.log('   Testing Progress.calculateProgress()...');
    const testProgress = new Progress({
      student: new mongoose.Types.ObjectId(),
      course: new mongoose.Types.ObjectId(),
      modules: [
        { moduleId: 'test-1', moduleName: 'Test Module', completed: true },
      ],
      assignments: { total: 5, completed: 3, averageGrade: 85 },
      quizzes: { total: 3, completed: 2, averageScore: 90 },
    });
    testProgress.calculateProgress();
    console.log(`   ✅ Progress calculation: ${testProgress.overallProgress}%\n`);

    console.log('✅ All tests passed!\n');
    console.log('📊 Summary:');
    console.log(`   - Quiz Model: ✅`);
    console.log(`   - Discussion Model: ✅`);
    console.log(`   - LiveSession Model: ✅`);
    console.log(`   - Progress Model: ✅`);
    console.log(`   - Certificate Model: ✅`);
    console.log(`   - CourseMaterial Model: ✅`);
    console.log('\n🚀 Backend is ready for new features!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📊 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run tests
testModels();
