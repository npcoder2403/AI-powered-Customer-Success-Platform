#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

PYTHON="/opt/homebrew/bin/python3.13"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Customer Success Platform${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

stop_services() {
    echo -e "${YELLOW}Stopping any running services...${NC}"

    lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null || true

    lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true

    echo -e "${GREEN}Services stopped.${NC}"
}

start_services() {
    print_header

    echo -e "${BLUE}[1/2] Starting Backend...${NC}"
    cd "$PROJECT_DIR/backend"

    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}  Creating Python virtual environment (Python 3.13)...${NC}"
        $PYTHON -m venv venv
    fi

    source venv/bin/activate
    echo -e "${YELLOW}  Installing Python dependencies...${NC}"
    pip install -r requirements.txt --quiet 2>&1 | grep -v "^WARNING" || true

    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo -e "${GREEN}  Backend started (PID: $BACKEND_PID)${NC}"
    echo ""

    echo -e "${BLUE}[2/2] Starting Frontend...${NC}"
    cd "$PROJECT_DIR/frontend"

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  Installing npm dependencies...${NC}"
        npm install --silent
    fi

    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}  Frontend started (PID: $FRONTEND_PID)${NC}"

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  All services running!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "  Frontend:  ${YELLOW}http://localhost:3000${NC}"
    echo -e "  Backend:   ${YELLOW}http://localhost:8000${NC}"
    echo -e "  API Docs:  ${YELLOW}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"

    trap "echo ''; echo -e '${RED}Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

    wait
}

case "${1:-}" in
    stop)
        stop_services
        ;;
    *)
        stop_services
        start_services
        ;;
esac
