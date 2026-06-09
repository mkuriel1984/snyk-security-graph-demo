#!/bin/bash

echo "🚀 Starting Snyk Security Graph Interactive Demo..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Start services
echo -e "${BLUE}Starting Docker services...${NC}"
docker-compose up -d postgres

# Wait for Postgres
echo -e "${YELLOW}Waiting for Postgres to be ready...${NC}"
sleep 10

# Load sample data
echo -e "${BLUE}Loading sample data...${NC}"
docker exec -i snyk-graph-postgres psql -U snyk -d snyk_demo < scripts/load_sample_data.sql 2>&1 | tail -3

# Start frontend (locally for faster development)
echo -e "${BLUE}Starting frontend UI...${NC}"
cd frontend
npm install 2>&1 | tail -5
npm run dev &
FRONTEND_PID=$!

sleep 5

echo ""
echo -e "${GREEN}✅ Demo is ready!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🌐 Interactive UI:${NC}  http://localhost:3001"
echo -e "${BLUE}📊 Postgres:${NC}       localhost:5432"
echo -e "${YELLOW}📖 README:${NC}         README_DEMO.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop the demo"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping demo...'; kill $FRONTEND_PID 2>/dev/null; docker-compose down; exit 0" INT
wait
