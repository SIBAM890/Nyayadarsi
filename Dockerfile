FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set Hugging Face Spaces port requirement
ENV PORT=7860
EXPOSE 7860

# Ensure Python output is not buffered
ENV PYTHONUNBUFFERED=1

# Install system dependencies (sometimes needed for psycopg2, scipy, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first to leverage Docker cache
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory into /app/backend
COPY backend /app/backend

# Set PYTHONPATH so Python can resolve 'from backend.core...' imports
ENV PYTHONPATH=/app

# Start Uvicorn bound to 0.0.0.0 and port 7860
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
