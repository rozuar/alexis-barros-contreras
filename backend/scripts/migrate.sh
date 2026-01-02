#!/bin/sh
# Migration script: copies images from source to Railway Volume on first deploy

ARTWORKS_DIR="${ARTWORKS_DIR:-/app/art}"
SOURCE_DIR="/app/art-source"
MARKER_FILE="$ARTWORKS_DIR/.migrated"

echo "Checking migration status..."

# Create artworks dir if it doesn't exist
mkdir -p "$ARTWORKS_DIR"

# Only migrate if source exists and we haven't migrated yet
if [ -d "$SOURCE_DIR" ] && [ ! -f "$MARKER_FILE" ]; then
    echo "Starting image migration from $SOURCE_DIR to $ARTWORKS_DIR..."

    # Copy all contents preserving structure
    cp -r "$SOURCE_DIR"/* "$ARTWORKS_DIR/" 2>/dev/null || true

    # Create marker file to prevent re-migration
    touch "$MARKER_FILE"

    echo "Migration completed successfully!"
else
    if [ -f "$MARKER_FILE" ]; then
        echo "Already migrated, skipping..."
    else
        echo "No source directory found, skipping migration..."
    fi
fi

# Start the backend
echo "Starting backend server..."
exec /app/backend
