# VinylGPT

A self-hosted PWA for cataloging your vinyl record collection by snapping cover photos. VinylGPT uses OpenAI Vision for OCR, matches records against Discogs for metadata, caches an AI-generated “vibe” blurb, and stores everything in a simple SQLite database. Browse, filter, export—and all in one container.

---

## 🚀 Quick One-Line Install

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/orangesunshine321/vinylgpt/main/get-vinylgpt.sh)
```

> View the install script on GitHub:  
> https://github.com/orangesunshine321/vinylgpt/blob/main/get-vinylgpt.sh

---

## 🛠 Manual Install

```bash
# 1. Clone the repo and enter it
git clone https://github.com/orangesunshine321/vinylgpt.git
cd vinylgpt

# 2. Make everything executable
chmod +x install.sh get-vinylgpt.sh scripts/*.sh

# 3. Run the installer
./install.sh
```

**What `install.sh` does:**  
1. `scripts/prereqs.sh` – installs Docker & Docker Compose (if needed)  
2. `scripts/env_setup.sh` – prompts for `OPENAI_API_KEY`, `DISCOGS_TOKEN`, writes `.env.local`  
3. Copies `.env.local` → `.env` so Compose can see your vars  
4. `scripts/compose_up.sh` – `docker-compose up -d --build`

---

## 📄 Environment Variables

The installer creates `.env.local` (and copies to `.env`). It contains:

```bash
OPENAI_API_KEY=your_openai_key_here
DISCOGS_TOKEN=your_discogs_token_here
DATABASE_URL=file:./dev.db
```

- **OPENAI_API_KEY** – for Vision OCR & AI blurb  
- **DISCOGS_TOKEN** – your Discogs user token  
- **DATABASE_URL** – SQLite path (defaults to `dev.db`)

---

## 🐳 Docker Compose

Bring up the single `app` service:

```bash
docker-compose up -d --build
```

- **Ports:** `3000 → 3000`  
- **Volumes:** `./uploads` (images) & `./dev.db` (SQLite)  

Check it:

```bash
docker-compose ps
docker-compose logs -f
```

---

## ✅ Smoke-Tests

### 1. API Healthcheck

```bash
curl http://localhost:3000/api/records
# → should return []
```

### 2. Upload a Test Cover

```bash
curl -X POST http://localhost:3000/api/records/upload \
  -F 'image=@/full/path/to/cover.jpg;type=image/jpeg'
# → returns JSON with artist/title, Discogs metadata, etc.
```

### 3. Browse the UI

Open your browser at:

```
http://<your-server-ip>:3000
```

Snap a photo or upload, then watch your record appear.

### 4. Export CSV

```bash
curl http://localhost:3000/api/records/export?format=csv > records.csv
```

---

## ⚙️ Development

If you prefer to run without Docker:

```bash
# Install deps
npm install

# Generate Prisma client & push schema
npx prisma generate
npx prisma migrate dev --name init

# Run dev server
npm run dev
```

Visit `http://localhost:3000`.

---

## 🔧 Troubleshooting

- **“docker-compose: command not found”**  
  Ensure Docker Compose v1 or v2 is installed (see `scripts/prereqs.sh`).

- **Environment vars not loaded**  
  Verify `.env` exists in repo root with the three variables above.

- **Permission denied on scripts**  
  Run `chmod +x install.sh get-vinylgpt.sh scripts/*.sh`.

- **Healthcheck failures**  
  Wait 10–20 seconds for the app to build & start, then re-run `docker-compose up -d`.

- **Windows/WSL2 users**  
  Use a WSL2 shell or Git Bash. Ensure line endings are LF (`.gitattributes` helps).

---

## 🤝 Contributing

1. Fork & clone  
2. Create a feature branch (`git checkout -b feat/your-feature`)  
3. Run `npm run lint && npm run typecheck` before pushing  
4. Open a PR—happy to review!
