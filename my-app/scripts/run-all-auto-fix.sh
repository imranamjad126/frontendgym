#!/bin/bash

# COMPLETE AUTO-FIX SCRIPT
# This script runs all auto-fix tools in sequence

echo "🚀 Starting Complete Auto-Fix Process..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Vercel Environment Variables
echo -e "${YELLOW}Step 1: Fixing Vercel Environment Variables...${NC}"
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ VERCEL_TOKEN not set${NC}"
    echo "   Set it with: export VERCEL_TOKEN=your_token"
else
    node scripts/auto-fix-vercel.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Vercel fix complete${NC}"
    else
        echo -e "${RED}❌ Vercel fix failed${NC}"
    fi
fi
echo ""

# Step 2: Supabase Admin User
echo -e "${YELLOW}Step 2: Fixing Supabase Admin User...${NC}"
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    echo "   Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_key"
else
    node scripts/auto-fix-supabase.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Supabase fix complete${NC}"
    else
        echo -e "${RED}❌ Supabase fix failed${NC}"
    fi
fi
echo ""

# Step 3: Summary
echo -e "${GREEN}✅ Auto-Fix Process Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Wait for Vercel deployment to complete"
echo "2. Test login at: https://mynew-frontendgym.vercel.app/login"
echo "3. Use credentials: fitnesswithimran1@gmail.com / Aa543543@"

