#!/bin/bash
# Database Inspection Helper Script

DB_PATH="database/ai_company.db"

echo "🗄️  AI Company Database Inspector"
echo "=================================="

if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found at $DB_PATH"
    echo "Run: node database/setup.js"
    exit 1
fi

echo "✅ Database exists"
echo ""

# Show table counts
echo "📊 Record Counts:"
echo "-----------------"
sqlite3 $DB_PATH "SELECT 'Ideas: ' || COUNT(*) FROM ideas;"
sqlite3 $DB_PATH "SELECT 'Research: ' || COUNT(*) FROM research;"
sqlite3 $DB_PATH "SELECT 'Products: ' || COUNT(*) FROM products;"
sqlite3 $DB_PATH "SELECT 'Agent Activities: ' || COUNT(*) FROM agent_activities;"
sqlite3 $DB_PATH "SELECT 'Votes: ' || COUNT(*) FROM votes;"
sqlite3 $DB_PATH "SELECT 'Token Holders: ' || COUNT(*) FROM token_holders;"
echo ""

# Show recent ideas
echo "💡 Recent Ideas:"
echo "-----------------"
sqlite3 $DB_PATH -header -column "SELECT id, title, status, created_at FROM ideas ORDER BY created_at DESC LIMIT 5;"
echo ""

# Show recent agent activities
echo "🤖 Recent Agent Activities:"
echo "----------------------------"
sqlite3 $DB_PATH -header -column "SELECT agent_name, activity, created_at FROM agent_activities ORDER BY created_at DESC LIMIT 10;"
echo ""

echo "To explore more, run: sqlite3 $DB_PATH"
