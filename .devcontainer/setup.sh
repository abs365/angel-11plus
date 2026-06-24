#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "======================================"
echo "  Angel 11+ — Codespace Setup"
echo "======================================"
echo ""

echo "--> Installing npm dependencies..."
npm install
echo "    Done."
echo ""

echo "======================================"
echo "  Setup complete."
echo ""
echo "  Next steps:"
echo ""
echo "  1. Confirm secrets are injected:"
echo "       echo \$NEXT_PUBLIC_SUPABASE_URL"
echo ""
echo "  2. Start the dev server:"
echo "       npm run dev"
echo ""
echo "  3. Open port 3000 in the Ports tab."
echo ""
echo "  The app works without any secrets."
echo "  Supabase sync and AI feedback require"
echo "  environment variables to be set."
echo ""
echo "  See CLOUD_WORKSPACE.md for full details."
echo "======================================"
echo ""
