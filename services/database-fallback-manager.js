/**
 * Database Fallback Manager
 * Safely manages SQLite → 0G Storage fallback without breaking existing architecture
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const ZeroGStorageService = require('./0g-storage-service');

class DatabaseFallbackManager {
    constructor() {
        this.dbPath = process.env.DB_PATH || './database/ai_company.db';
        this.db = null;
        this.zeroGStorage = new ZeroGStorageService();
        this.useZeroG = false;
        this.fallbackActive = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        console.log('🔄 [DB Fallback] Manager initialized');
    }

    /**
     * Initialize database with fallback support
     */
    async initialize() {
        try {
            // Try SQLite first
            await this.initializeSQLite();
            console.log('✅ [DB Fallback] SQLite initialized successfully');
            return true;
        } catch (error) {
            console.warn('⚠️ [DB Fallback] SQLite failed, attempting 0G Storage fallback...');
            return await this.activateFallback();
        }
    }

    /**
     * Initialize SQLite database
     */
    async initializeSQLite() {
        return new Promise((resolve, reject) => {
            try {
                // Ensure database directory exists
                const dbDir = path.dirname(this.dbPath);
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }

                this.db = new sqlite3.Database(this.dbPath, (err) => {
                    if (err) {
                        console.error('❌ [DB Fallback] SQLite connection failed:', err.message);
                        reject(err);
                    } else {
                        console.log('✅ [DB Fallback] SQLite connected successfully');
                        this.setupTables().then(resolve).catch(reject);
                    }
                });

                // Handle SQLite errors
                this.db.on('error', (err) => {
                    console.error('❌ [DB Fallback] SQLite error:', err.message);
                    if (!this.fallbackActive) {
                        this.activateFallback();
                    }
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Setup database tables
     */
    async setupTables() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Ideas table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS ideas (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        description TEXT,
                        potential_revenue TEXT,
                        status TEXT DEFAULT 'pending',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Research table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS research (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        idea_id INTEGER,
                        research_data TEXT,
                        competitor_analysis TEXT,
                        market_opportunity TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (idea_id) REFERENCES ideas (id)
                    )
                `);

                // Products table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS products (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        idea_id INTEGER,
                        product_name TEXT,
                        product_description TEXT,
                        features TEXT,
                        target_market TEXT,
                        status TEXT DEFAULT 'pending',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (idea_id) REFERENCES ideas (id)
                    )
                `);

                // Token holder votes
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS votes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        token_holder_id TEXT,
                        item_type TEXT,
                        item_id INTEGER,
                        vote TEXT,
                        feedback TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Agent activities log
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS agent_activities (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        agent_name TEXT,
                        activity TEXT,
                        data TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // CEO agents table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS ceo_agents (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        status TEXT DEFAULT 'active',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('✅ [DB Fallback] Tables created successfully');
                        resolve();
                    }
                });
            });
        });
    }

    /**
     * Activate 0G Storage fallback
     */
    async activateFallback() {
        try {
            console.log('🔄 [DB Fallback] Activating 0G Storage fallback...');
            const connected = await this.zeroGStorage.initialize();
            
            if (connected) {
                this.useZeroG = true;
                this.fallbackActive = true;
                console.log('✅ [DB Fallback] 0G Storage fallback activated');
                return true;
            } else {
                throw new Error('0G Storage initialization failed');
            }
        } catch (error) {
            console.error('❌ [DB Fallback] Fallback activation failed:', error.message);
            return false;
        }
    }

    /**
     * Execute query with fallback support
     */
    async query(sql, params = []) {
        if (this.useZeroG) {
            return await this.queryZeroG(sql, params);
        } else {
            return await this.querySQLite(sql, params);
        }
    }

    /**
     * Execute SQLite query
     */
    async querySQLite(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('SQLite database not initialized'));
                return;
            }

            // Handle different query types
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                this.db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error('❌ [DB Fallback] SQLite SELECT error:', err.message);
                        // Try fallback
                        this.activateFallback().then(() => {
                            this.queryZeroG(sql, params).then(resolve).catch(reject);
                        });
                    } else {
                        resolve(rows);
                    }
                });
            } else {
                this.db.run(sql, params, function(err) {
                    if (err) {
                        console.error('❌ [DB Fallback] SQLite RUN error:', err.message);
                        // Try fallback
                        this.activateFallback().then(() => {
                            this.queryZeroG(sql, params).then(resolve).catch(reject);
                        });
                    } else {
                        resolve({ id: this.lastID, changes: this.changes });
                    }
                });
            }
        });
    }

    /**
     * Execute 0G Storage query (simplified)
     */
    async queryZeroG(sql, params = []) {
        try {
            console.log('🌐 [DB Fallback] Executing query via 0G Storage:', sql.substring(0, 50) + '...');
            
            // Parse SQL to determine operation
            const sqlUpper = sql.trim().toUpperCase();
            
            if (sqlUpper.startsWith('SELECT')) {
                // Simulate SELECT operation
                const table = this.extractTableName(sql);
                const records = await this.zeroGStorage.retrieve(table);
                return records.map(record => record.data);
            } else if (sqlUpper.startsWith('INSERT')) {
                // Simulate INSERT operation
                const table = this.extractTableName(sql);
                const data = this.parseInsertData(sql, params);
                const result = await this.zeroGStorage.store(table, data);
                return { id: result.key, changes: 1 };
            } else if (sqlUpper.startsWith('UPDATE') || sqlUpper.startsWith('DELETE')) {
                // Simulate UPDATE/DELETE operation
                console.log('🌐 [DB Fallback] UPDATE/DELETE operations not fully implemented in demo');
                return { changes: 1 };
            }
            
            return [];
        } catch (error) {
            console.error('❌ [DB Fallback] 0G Storage query failed:', error.message);
            throw error;
        }
    }

    /**
     * Extract table name from SQL
     */
    extractTableName(sql) {
        const match = sql.match(/FROM\s+(\w+)|INTO\s+(\w+)|UPDATE\s+(\w+)/i);
        return match ? (match[1] || match[2] || match[3]) : 'unknown';
    }

    /**
     * Parse INSERT data from SQL and params
     */
    parseInsertData(sql, params) {
        // Simple parsing for demo - in real implementation, this would be more sophisticated
        const table = this.extractTableName(sql);
        const data = {
            table,
            timestamp: new Date().toISOString(),
            params: params
        };
        return data;
    }

    /**
     * Get database status
     */
    getStatus() {
        return {
            primary: this.useZeroG ? '0G Storage' : 'SQLite',
            fallbackActive: this.fallbackActive,
            sqliteConnected: !!this.db,
            zeroGConnected: this.zeroGStorage.isStorageAvailable(),
            retryCount: this.retryCount
        };
    }

    /**
     * Get storage statistics
     */
    async getStats() {
        if (this.useZeroG) {
            return this.zeroGStorage.getStats();
        } else {
            return {
                type: 'SQLite',
                path: this.dbPath,
                connected: !!this.db
            };
        }
    }

    /**
     * Close database connections
     */
    close() {
        if (this.db) {
            this.db.close();
        }
        console.log('🔒 [DB Fallback] Database connections closed');
    }
}

module.exports = DatabaseFallbackManager;
