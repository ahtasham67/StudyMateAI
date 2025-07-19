#!/binecho "🎓 StudyMateAI Application Launcher"
echo "======================================"
echo ""
echo "Select how you want to start StudyMateAI:"h

# StudyMateAI - Main Launcher Script
# This script provides options to start StudyMateAI in different modes

clear
echo "🎓 StudyMate Application Launcher"
echo "================================="
echo ""
echo "Select how you want to start StudyMate:"
echo ""
echo "1) 🔥 Development Mode (with hot reload)"
echo "2) 🚀 Standard Mode (production-like)"
echo "3) 🏭 Production Build & Start"
echo "4) 🛑 Stop All Services"
echo "5) ❌ Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "Starting in Development Mode..."
        ./start-dev.sh
        ;;
    2)
        echo ""
        echo "Starting in Standard Mode..."
        ./start-all.sh
        ;;
    3)
        echo ""
        echo "Building and starting in Production Mode..."
        ./start-prod.sh
        ;;
    4)
        echo ""
        echo "Stopping all services..."
        ./stop-all.sh
        ;;
    5)
        echo ""
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please select 1-5."
        exit 1
        ;;
esac
