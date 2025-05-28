### Setup

1. Clone the repo  
2. `chmod +x install.sh`  
3. `./install.sh`

   - You’ll be prompted for:
     - **OpenAI API Key**
     - **Discogs Token**
     - **(Optional)** Path to your Google Cloud Vision service-account JSON

4. Once complete, the installer will:
   - Copy your GCP JSON to `gcp-sa.json` (ignored by Git)
   - Write all keys into `.env.local`
   - Launch `docker-compose` with Vision support
