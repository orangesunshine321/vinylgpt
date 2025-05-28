cat > get-vinylgpt.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# 1) Where to install
TARGET="${1:-vinylgpt}"

# 2) Clone or update repo
if [ -d "$TARGET/.git" ]; then
  echo "→ Updating existing VinylGPT in $TARGET"
  git -C "$TARGET" pull --ff-only
else
  echo "→ Cloning VinylGPT into $TARGET"
  git clone https://github.com/orangesunshine321/vinylgpt.git "$TARGET"
fi

# 3) Enter and install
cd "$TARGET"
chmod +x install.sh scripts/*.sh get-vinylgpt.sh
echo "→ Running install.sh"
./install.sh

echo
echo "🎉 VinylGPT is now running!"
echo "→ Browse: http://$(hostname -I | awk '{print $1}'):3000"
EOF

chmod +x get-vinylgpt.sh
