#!/bin/bash
# Brand Brew Media — One-time setup script

set -e

echo ""
echo "================================================"
echo "  Brand Brew Media — Setup Script"
echo "================================================"
echo ""

# Install NVM (Node Version Manager)
if ! command -v nvm &>/dev/null && [ ! -d "$HOME/.nvm" ]; then
  echo "Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  echo "NVM already installed."
fi

# Install Node.js 20 LTS
echo "Installing Node.js 20 LTS..."
nvm install 20
nvm use 20
nvm alias default 20

echo ""
echo "Node.js $(node -v) installed."
echo "npm $(npm -v) installed."
echo ""

# Install project dependencies
echo "Installing project dependencies..."
cd "$(dirname "$0")"
npm install

echo ""
echo "================================================"
echo "  Setup complete!"
echo "  Run the app with:  npm run dev"
echo "  Open:              http://localhost:3000"
echo "  Admin:             http://localhost:3000/admin"
echo "  Admin login:       admin / brandbrew2025"
echo "================================================"
echo ""
