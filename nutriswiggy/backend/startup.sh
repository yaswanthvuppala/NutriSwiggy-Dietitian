#!/bin/bash
# Azure App Service startup script for NutriSwiggy Backend
# The code is deployed at /home/site/wwwroot/ (contents of backend/)
# Imports use 'from backend.xxx', so we create a symlink so Python can resolve them.

# Create a 'backend' symlink pointing to the current directory
# This allows 'from backend.services.database import ...' to work
if [ ! -e /home/site/wwwroot/backend ]; then
    ln -s /home/site/wwwroot /home/site/wwwroot/backend
fi

# Start the FastAPI server
exec gunicorn main:app --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120
