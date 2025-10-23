/**
 * Database Setup with 0G Storage Fallback
 * This is a safe wrapper around the existing database setup
 * It maintains 100% compatibility while adding 0G fallback
 */

const DatabaseFallbackManager = require('../services/database-fallback-manager');

// Create global fallback manager instance
const dbManager = new DatabaseFallbackManager();

// Initialize database with fallback support
async function initializeDatabase() {
    try {
        console.log('🚀 [DB Setup] Initializing database with 0G Storage fallback...');
        const success = await dbManager.initialize();
        
        if (success) {
            console.log('✅ [DB Setup] Database initialized successfully');
            console.log('📊 [DB Setup] Status:', dbManager.getStatus());
            return dbManager;
        } else {
            throw new Error('Database initialization failed');
        }
    } catch (error) {
        console.error('❌ [DB Setup] Database initialization failed:', error.message);
        throw error;
    }
}

// Export the database manager for use in routes
module.exports = {
    dbManager,
    initializeDatabase,
    
    // Compatibility functions that maintain existing API
    async query(sql, params = []) {
        return await dbManager.query(sql, params);
    },
    
    async getStatus() {
        return dbManager.getStatus();
    },
    
    async getStats() {
        return await dbManager.getStats();
    },
    
    close() {
        dbManager.close();
    }
};

// Auto-initialize if this file is run directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('🎉 [DB Setup] Database setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 [DB Setup] Database setup failed:', error.message);
            process.exit(1);
        });
}
