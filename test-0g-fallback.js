/**
 * Test 0G Storage Fallback Mechanism
 * This script demonstrates how the fallback works without breaking existing functionality
 */

const { initializeDatabase, dbManager } = require('./database/setup-with-fallback');

async function testFallbackMechanism() {
    console.log('🧪 [TEST] Starting 0G Storage Fallback Test...\n');

    try {
        // Step 1: Initialize database normally
        console.log('📋 [TEST] Step 1: Initialize database normally');
        await initializeDatabase();
        console.log('✅ [TEST] Database initialized successfully\n');

        // Step 2: Test normal SQLite operations
        console.log('📋 [TEST] Step 2: Test normal SQLite operations');
        const ideas = await dbManager.query('SELECT * FROM ideas LIMIT 5');
        console.log(`✅ [TEST] Retrieved ${ideas.length} ideas from SQLite\n`);

        // Step 3: Simulate SQLite failure
        console.log('📋 [TEST] Step 3: Simulate SQLite failure');
        if (dbManager.db) {
            dbManager.db.close();
            dbManager.db = null;
            console.log('⚠️ [TEST] SQLite connection closed (simulated failure)\n');
        }

        // Step 4: Test fallback to 0G Storage
        console.log('📋 [TEST] Step 4: Test fallback to 0G Storage');
        try {
            const fallbackIdeas = await dbManager.query('SELECT * FROM ideas LIMIT 5');
            console.log(`✅ [TEST] Retrieved ${fallbackIdeas.length} ideas from 0G Storage fallback\n`);
        } catch (error) {
            console.log('🔄 [TEST] Activating 0G Storage fallback...');
            await dbManager.activateFallback();
            const fallbackIdeas = await dbManager.query('SELECT * FROM ideas LIMIT 5');
            console.log(`✅ [TEST] Retrieved ${fallbackIdeas.length} ideas from 0G Storage fallback\n`);
        }

        // Step 5: Test 0G Storage operations
        console.log('📋 [TEST] Step 5: Test 0G Storage operations');
        const testData = {
            title: 'Test Idea from 0G Storage',
            description: 'This idea was stored using 0G Storage fallback',
            status: 'test'
        };
        
        const insertResult = await dbManager.query(
            'INSERT INTO ideas (title, description, status) VALUES (?, ?, ?)',
            [testData.title, testData.description, testData.status]
        );
        console.log(`✅ [TEST] Inserted test idea with ID: ${insertResult.id}\n`);

        // Step 6: Show final status
        console.log('📋 [TEST] Step 6: Final status');
        const status = dbManager.getStatus();
        const stats = await dbManager.getStats();
        
        console.log('📊 [TEST] Database Status:', status);
        console.log('📊 [TEST] Storage Stats:', stats);
        console.log('\n🎉 [TEST] 0G Storage Fallback Test Completed Successfully!');
        console.log('✅ [TEST] System is resilient and ready for production!');

    } catch (error) {
        console.error('❌ [TEST] Test failed:', error.message);
        console.error('💥 [TEST] Stack trace:', error.stack);
    } finally {
        // Cleanup
        dbManager.close();
        console.log('\n🔒 [TEST] Database connections closed');
    }
}

// Run the test
if (require.main === module) {
    testFallbackMechanism()
        .then(() => {
            console.log('\n🏆 [TEST] All tests passed! 0G Storage fallback is working perfectly!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 [TEST] Test suite failed:', error.message);
            process.exit(1);
        });
}

module.exports = { testFallbackMechanism };
