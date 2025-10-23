/**
 * 0G Storage Service - Fallback for SQLite
 * This service provides a fallback mechanism when SQLite fails
 * Simulates 0G Storage API for hackathon demonstration
 */

class ZeroGStorageService {
    constructor() {
        this.isAvailable = true;
        this.storage = new Map(); // In-memory storage for demo
        this.connected = false;
        console.log('🌐 [0G Storage] Service initialized (Demo Mode)');
    }

    /**
     * Initialize connection to 0G Storage
     */
    async initialize() {
        try {
            // Simulate 0G Storage connection
            await this.simulateConnection();
            this.connected = true;
            console.log('✅ [0G Storage] Connected successfully');
            return true;
        } catch (error) {
            console.error('❌ [0G Storage] Connection failed:', error.message);
            this.connected = false;
            return false;
        }
    }

    /**
     * Simulate connection delay
     */
    async simulateConnection() {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('🔗 [0G Storage] Simulating connection to 0G Network...');
                resolve();
            }, 100);
        });
    }

    /**
     * Store data in 0G Storage
     */
    async store(table, data) {
        if (!this.connected) {
            throw new Error('0G Storage not connected');
        }

        try {
            const key = `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.storage.set(key, {
                table,
                data,
                timestamp: new Date().toISOString(),
                hash: this.generateHash(JSON.stringify(data))
            });
            
            console.log(`💾 [0G Storage] Stored data in table '${table}' with key '${key}'`);
            return { success: true, key, hash: this.generateHash(JSON.stringify(data)) };
        } catch (error) {
            console.error(`❌ [0G Storage] Store failed for table '${table}':`, error.message);
            throw error;
        }
    }

    /**
     * Retrieve data from 0G Storage
     */
    async retrieve(table, key = null) {
        if (!this.connected) {
            throw new Error('0G Storage not connected');
        }

        try {
            if (key) {
                // Retrieve specific record
                const record = this.storage.get(key);
                if (record && record.table === table) {
                    console.log(`📥 [0G Storage] Retrieved record '${key}' from table '${table}'`);
                    return record.data;
                } else {
                    return null;
                }
            } else {
                // Retrieve all records for table
                const records = [];
                for (const [k, v] of this.storage.entries()) {
                    if (v.table === table) {
                        records.push({
                            key: k,
                            data: v.data,
                            timestamp: v.timestamp,
                            hash: v.hash
                        });
                    }
                }
                console.log(`📥 [0G Storage] Retrieved ${records.length} records from table '${table}'`);
                return records;
            }
        } catch (error) {
            console.error(`❌ [0G Storage] Retrieve failed for table '${table}':`, error.message);
            throw error;
        }
    }

    /**
     * Delete data from 0G Storage
     */
    async delete(table, key) {
        if (!this.connected) {
            throw new Error('0G Storage not connected');
        }

        try {
            const record = this.storage.get(key);
            if (record && record.table === table) {
                this.storage.delete(key);
                console.log(`🗑️ [0G Storage] Deleted record '${key}' from table '${table}'`);
                return { success: true };
            } else {
                return { success: false, error: 'Record not found' };
            }
        } catch (error) {
            console.error(`❌ [0G Storage] Delete failed for table '${table}':`, error.message);
            throw error;
        }
    }

    /**
     * Check if 0G Storage is available
     */
    isStorageAvailable() {
        return this.connected && this.isAvailable;
    }

    /**
     * Get storage statistics
     */
    getStats() {
        const stats = {
            connected: this.connected,
            totalRecords: this.storage.size,
            tables: {},
            lastActivity: new Date().toISOString()
        };

        // Count records per table
        for (const [key, record] of this.storage.entries()) {
            if (!stats.tables[record.table]) {
                stats.tables[record.table] = 0;
            }
            stats.tables[record.table]++;
        }

        return stats;
    }

    /**
     * Generate a simple hash for data integrity
     */
    generateHash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    /**
     * Simulate network failure for testing
     */
    simulateFailure() {
        this.connected = false;
        console.log('⚠️ [0G Storage] Simulating network failure...');
    }

    /**
     * Recover from simulated failure
     */
    async recover() {
        console.log('🔄 [0G Storage] Attempting to recover...');
        await this.initialize();
    }
}

module.exports = ZeroGStorageService;
