# Oracle VM Heavy Generation Worker

This project already has a dedicated worker entrypoint:

```bash
npm run worker:heavy-generation
```

Use the Oracle VM only for this worker. Keep the Next.js web app deployed separately.

## 1. Connect to the VM

Copy the public IPv4 address from Oracle Cloud instance details.

For Ubuntu:

```powershell
ssh -i C:\path\to\oracle-key.key ubuntu@YOUR_PUBLIC_IP
```

For Oracle Linux:

```powershell
ssh -i C:\path\to\oracle-key.key opc@YOUR_PUBLIC_IP
```

If Windows rejects the key permissions:

```powershell
icacls C:\path\to\oracle-key.key /inheritance:r
icacls C:\path\to\oracle-key.key /grant:r "$env:USERNAME:R"
```

## 2. Install runtime on Ubuntu

```bash
sudo apt update
sudo apt install -y git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v
npm -v
pm2 -v
```

## 3. Clone and install

```bash
git clone YOUR_GITHUB_REPO_URL nova-ai
cd nova-ai
npm ci
```

If the VM is ARM, `npm ci` is still fine for this project because dependencies are JavaScript/Node compatible. If one native package fails, run `npm install` and check the package error.

## 4. Create `.env`

Create the env file:

```bash
nano .env
```

Minimum required values for the worker:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
DATABASE_POOL_MAX=2
REDIS_URL=redis://...

GROQ_API_KEY=
GROQ_HEAVY_API_KEYS=key1,key2,key3
GROQ_LIGHT_API_KEYS=
GROQ_PAID_API_KEY=
GROQ_USE_PAID_FIRST=false

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SMTP_USER=
SMTP_PASS=
SMTP_SERVICE=gmail
ADMIN_ALERT_EMAIL=

HEAVY_GENERATION_CONCURRENCY=1
HEAVY_GENERATION_INLINE_WORKER=false
```

Notes:

- `REDIS_URL` is required because the queue uses BullMQ.
- `DATABASE_URL` must point to the same database used by the web app.
- Use `GROQ_HEAVY_API_KEYS` for multiple free Groq keys, comma-separated.
- Start with `HEAVY_GENERATION_CONCURRENCY=1`. Increase only after confirming key limits and DB/Redis stability.

## 5. Start with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

`pm2 startup` prints one extra command. Copy and run that command.

Useful commands:

```bash
pm2 status
pm2 logs nova-heavy-generation-worker
pm2 restart nova-heavy-generation-worker
pm2 stop nova-heavy-generation-worker
```

## 6. Verify

Run:

```bash
pm2 logs nova-heavy-generation-worker
```

Expected startup log:

```text
Heavy generation worker started.
```

Then create a course from the web app. The UI should no longer show "Generation worker is not running" once the worker is connected to Redis.

## 7. Updating after code changes

```bash
cd ~/nova-ai
git pull
npm ci
pm2 restart nova-heavy-generation-worker
pm2 logs nova-heavy-generation-worker
```

## 8. Redis requirement

The worker cannot run without Redis. Good options:

- Upstash Redis free tier for easiest setup.
- Redis installed on the same Oracle VM if you want no extra provider.

For same-VM Redis on Ubuntu:

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
redis-cli ping
```

Then use:

```env
REDIS_URL=redis://127.0.0.1:6379
```
