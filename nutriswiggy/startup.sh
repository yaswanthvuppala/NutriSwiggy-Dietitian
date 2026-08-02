#!/bin/bash
# Azure App Service startup script for NutriSwiggy Backend
# This script sets up the correct Python path and starts the FastAPI server.
# Azure App Service deploys the 'nutriswiggy' directory, so 'backend' is a subdirectory.

# Ensure the parent directory is in PYTHONPATH so 'from backend.xxx' imports work
export PYTHONPATH="/home/site/wwwroot:$PYTHONPATH"

# Install dependencies from the backend requirements
pip install -r backend/requirements.txt 2>/dev/null

# Start uvicorn pointing to the correct module path
cd /home/site/wwwroot
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000
