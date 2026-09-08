#!/bin/bash
# Replaces the default backend localhost URLs with Render runtime environment variables.
if [ ! -z "$VITE_API_URL" ]; then
    echo "Injecting backend API url: $VITE_API_URL"
    sed -i "s|http://localhost:8080/api/v1|$VITE_API_URL|g" src/services/apiService.js
fi
if [ ! -z "$VITE_AI_SERVICE_URL" ]; then
    echo "Injecting AI service url: $VITE_AI_SERVICE_URL"
    sed -i "s|http://localhost:8000/ai/v1|$VITE_AI_SERVICE_URL|g" src/services/apiService.js
fi
