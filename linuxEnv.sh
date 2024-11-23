#!/bin/bash

# Navigate to the server directory
cd server || { echo "Directory 'server' not found."; exit 1; }

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "@@ Node.js is required. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - # Replace "16.x" with your required version
    sudo apt-get install -y nodejs
else
    echo "@@ Node.js is already installed."
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "@@ NPM is required. Installing..."
    sudo apt install -y npm
else
    echo "@@ NPM is already installed."
fi

# Initialize npm if package.json does not exist
if [ ! -f package.json ]; then
    echo "@@ Initializing npm..."
    npm init -y
else
    echo "@@ package.json already exists. Skipping initialization."
fi

# Install required packages
echo "@@ Installing required npm packages..."
npm install express open fs cors body-parser dotenv mssql

# Install development dependencies
echo "@@ Installing development tools..."
npm install --save-dev nodemon eslint

# Optional: Configure ESLint (uncomment to initialize ESLint)
# echo "@@ Starting ESLint setup..."
# npx eslint --init

# Start the server
echo "@@ Starting the server..."
node server.js