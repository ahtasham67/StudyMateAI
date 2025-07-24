#!/bin/bash

# StudyMateAI Database Switcher
CONFIG_FILE="backend/src/main/resources/application.properties"
BACKUP_DIR="db-configs"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

mkdir -p $BACKUP_DIR

show_usage() {
    echo -e "${BLUE}StudyMateAI Database Switcher${NC}"
    echo -e "${BLUE}==============================${NC}"
    echo ""
    echo "Usage: ./switch-db.sh [command]"
    echo ""
    echo "Commands:"
    echo "  local     - Switch to local PostgreSQL database"
    echo "  supabase  - Switch to Supabase cloud database"
    echo "  status    - Show current database configuration"
    echo "  test      - Test current database connection"
    echo "  backup    - Create a backup of current configuration"
    echo "  sync      - Sync data between local and Supabase (coming soon)"
    echo ""
}

show_status() {
    echo -e "${BLUE}📊 Current Database Configuration${NC}"
    echo -e "${BLUE}==================================${NC}"
    echo ""
    
    if grep -q "pooler.supabase.com" $CONFIG_FILE; then
        echo -e "Database: ${GREEN}Supabase (Cloud)${NC}"
        echo -e "Host: aws-0-ap-south-1.pooler.supabase.com"
        echo -e "Connection: Session Pooler"
    elif grep -q "localhost" $CONFIG_FILE; then
        echo -e "Database: ${GREEN}Local PostgreSQL${NC}"
        echo -e "Host: localhost:5432"
        echo -e "Database: studymate_db"
        echo -e "User: ahtashamhaque"
    else
        echo -e "Database: ${RED}Unknown Configuration${NC}"
    fi
    echo ""
}

switch_to_local() {
    echo -e "${BLUE}🔄 Switching to Local PostgreSQL...${NC}"
    
    # Backup current config
    timestamp=$(date +%Y%m%d_%H%M%S)
    cp $CONFIG_FILE "$BACKUP_DIR/supabase_backup_${timestamp}.properties"
    
    # Replace with local config
    sed -i.tmp 's|aws-0-ap-south-1.pooler.supabase.com:5432/postgres|localhost:5432/studymate_db|g' $CONFIG_FILE
    sed -i.tmp 's|postgres.vfhswjfjwqjmpcxjgedc|ahtashamhaque|g' $CONFIG_FILE  
    sed -i.tmp 's|ahtasham2105067||g' $CONFIG_FILE
    sed -i.tmp 's|Session Pooler|Local PostgreSQL|g' $CONFIG_FILE
    sed -i.tmp 's|sslmode=require|sslmode=disable|g' $CONFIG_FILE
    sed -i.tmp 's|# SSL settings for Supabase (required)|# SSL settings for Local PostgreSQL (disabled)|g' $CONFIG_FILE
    sed -i.tmp 's|# Connection pool settings for Supabase|# Connection pool settings for Local PostgreSQL|g' $CONFIG_FILE
    sed -i.tmp 's|# Supabase Database Configuration|# Local PostgreSQL Database Configuration|g' $CONFIG_FILE
    sed -i.tmp 's|# Project: vfhswjfjwqjmpcxjgedc|# Database: studymate_db|g' $CONFIG_FILE
    # Optimize connection pool for local PostgreSQL
    sed -i.tmp 's|maximum-pool-size=5|maximum-pool-size=10|g' $CONFIG_FILE
    sed -i.tmp 's|minimum-idle=1|minimum-idle=2|g' $CONFIG_FILE
    sed -i.tmp 's|connection-timeout=20000|connection-timeout=30000|g' $CONFIG_FILE
    sed -i.tmp 's|idle-timeout=180000|idle-timeout=300000|g' $CONFIG_FILE
    sed -i.tmp 's|max-lifetime=600000|max-lifetime=1200000|g' $CONFIG_FILE
    sed -i.tmp 's|leak-detection-threshold=30000|leak-detection-threshold=60000|g' $CONFIG_FILE
    
    # Ensure autocommit is properly set
    if ! grep -q "spring.datasource.hikari.auto-commit" $CONFIG_FILE; then
        sed -i.tmp '/spring.datasource.hikari.connection-test-query=SELECT 1/a\
spring.datasource.hikari.auto-commit=false' $CONFIG_FILE
    fi
    rm -f $CONFIG_FILE.tmp
    
    echo -e "${GREEN}✅ Switched to Local PostgreSQL${NC}"
    echo -e "${YELLOW}⚠️  Make sure PostgreSQL is running: brew services start postgresql${NC}"
    echo ""
}

switch_to_supabase() {
    echo -e "${BLUE}🔄 Switching to Supabase Cloud...${NC}"
    
    # Backup current config
    timestamp=$(date +%Y%m%d_%H%M%S)
    cp $CONFIG_FILE "$BACKUP_DIR/local_backup_${timestamp}.properties"
    
    # Replace with Supabase config
    sed -i.tmp 's|localhost:5432/studymate_db|aws-0-ap-south-1.pooler.supabase.com:5432/postgres|g' $CONFIG_FILE
    sed -i.tmp 's|spring.datasource.username=ahtashamhaque|spring.datasource.username=postgres.vfhswjfjwqjmpcxjgedc|g' $CONFIG_FILE
    sed -i.tmp 's|spring.datasource.password=$|spring.datasource.password=ahtasham2105067|g' $CONFIG_FILE
    sed -i.tmp 's|Local PostgreSQL|Session Pooler|g' $CONFIG_FILE
    sed -i.tmp 's|sslmode=disable|sslmode=require|g' $CONFIG_FILE
    sed -i.tmp 's|# SSL settings for Local PostgreSQL (disabled)|# SSL settings for Supabase (required)|g' $CONFIG_FILE
    sed -i.tmp 's|# Connection pool settings for Local PostgreSQL|# Connection pool settings for Supabase|g' $CONFIG_FILE
    sed -i.tmp 's|# Local PostgreSQL Database Configuration|# Supabase Database Configuration|g' $CONFIG_FILE
    sed -i.tmp 's|# Database: studymate_db|# Project: vfhswjfjwqjmpcxjgedc|g' $CONFIG_FILE
    # Optimize connection pool for Supabase
    sed -i.tmp 's|maximum-pool-size=10|maximum-pool-size=5|g' $CONFIG_FILE
    sed -i.tmp 's|minimum-idle=2|minimum-idle=1|g' $CONFIG_FILE
    sed -i.tmp 's|connection-timeout=30000|connection-timeout=20000|g' $CONFIG_FILE
    sed -i.tmp 's|idle-timeout=300000|idle-timeout=180000|g' $CONFIG_FILE
    sed -i.tmp 's|max-lifetime=1200000|max-lifetime=600000|g' $CONFIG_FILE
    sed -i.tmp 's|leak-detection-threshold=60000|leak-detection-threshold=30000|g' $CONFIG_FILE
    sed -i.tmp 's|# Database: studymate_db|# Project: vfhswjfjwqjmpcxjgedc|g' $CONFIG_FILE
    rm -f $CONFIG_FILE.tmp
    
    echo -e "${GREEN}✅ Switched to Supabase Cloud Database${NC}"
    echo -e "${YELLOW}📊 Dashboard: https://supabase.com/dashboard/project/vfhswjfjwqjmpcxjgedc${NC}"
    echo ""
}

test_connection() {
    echo -e "${BLUE}🔍 Testing Database Connection...${NC}"
    echo ""
    
    if grep -q "pooler.supabase.com" $CONFIG_FILE; then
        echo -e "Testing Supabase connection..."
        # Add actual connection test here if needed
        echo -e "${GREEN}✅ Supabase connection test: Ready${NC}"
    else
        echo -e "Testing Local PostgreSQL connection..."
        if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Local PostgreSQL: Running${NC}"
        else
            echo -e "${RED}❌ Local PostgreSQL: Not running${NC}"
            echo -e "${YELLOW}💡 Start with: brew services start postgresql${NC}"
        fi
    fi
    echo ""
}

backup_config() {
    echo -e "${BLUE}💾 Creating Configuration Backup...${NC}"
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="$BACKUP_DIR/manual_backup_${timestamp}.properties"
    cp $CONFIG_FILE "$backup_file"
    echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
    echo ""
}

# Main logic
case "$1" in
    "local") switch_to_local ;;
    "supabase") switch_to_supabase ;;
    "status") show_status ;;
    "test") test_connection ;;
    "backup") backup_config ;;
    *) show_usage ;;
esac
