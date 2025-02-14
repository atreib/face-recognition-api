#!/bin/bash

# Create necessary directories
mkdir -p models storage/faces storage/gallery

# Download face-api.js models
MODELS_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
MODELS=(
  "ssd_mobilenetv1_model-weights_manifest.json"
  "ssd_mobilenetv1_model-shard1"
  "ssd_mobilenetv1_model-shard2"
  "face_landmark_68_model-weights_manifest.json"
  "face_landmark_68_model-shard1"
  "face_recognition_model-weights_manifest.json"
  "face_recognition_model-shard1"
  "face_recognition_model-shard2"
)

echo "Downloading face-api.js models..."
cd models
for model in "${MODELS[@]}"; do
  if [ ! -f "$model" ]; then
    echo "Downloading $model..."
    curl -L -O "$MODELS_URL/$model"
  else
    echo "$model already exists, skipping..."
  fi
done
cd ..

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.sample .env
fi

# Make storage directories writable
chmod -R 755 storage

echo "Setup complete! 🎉"
echo "Now you can:"
echo "1. Add face images to storage/faces/"
echo "2. Create albums in storage/gallery/"
echo "3. Add pictures to your albums in storage/gallery/<album-name>/"
echo "4. Start the API with: npm run dev" 