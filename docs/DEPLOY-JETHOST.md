# Деплой на JetHost — автоматизиран

## Бърз старт (от Windows)

### Еднократно — 3 неща в cPanel (не може автоматично)

1. **MySQL** → създай база + user → копирай `DATABASE_URL`
2. **SSH Access** → активирай SSH, запиши host + username (+ ключ)
3. **Setup Node.js App** → Create:
   - Node **22**, Production
   - Root: `pamporovo-villa`
   - Startup: `dist/index.js`
   - URL: временният ти URL

### Автоматично — от твоя PC

```powershell
pnpm deploy:setup          # създава .deploy.env
# редактирай .deploy.env (SSH + DATABASE_URL + SITE_URL)
pnpm deploy:remote         # качва всичко и build-ва на сървъра
```

След първи deploy — auto-update при push:

```powershell
pnpm deploy:github-secrets   # след gh auth login
git push origin main         # GitHub Actions deploy-ва сам
```

---

## Какво прави `pnpm deploy:remote`

1. Генерира JWT + VAPID + admin парола → `.env.production.local`
2. SSH → clone/pull `github.com/Jhoseto/pamporovo-villa`
3. Качва `.env` на сървъра
4. Пуска `scripts/jethost-first-install.sh` (install, build, db:sync)

---

## Файлове

| Файл | Роля |
|------|------|
| `.deploy.env` | SSH + DB + URL (локално, gitignored) |
| `.deploy.env.example` | Шаблон |
| `.env.production.local` | Production secrets (gitignored) |
| `scripts/deploy-remote.ps1` | Главен deploy от Windows |
| `scripts/jethost-first-install.sh` | Install на сървъра |
| `scripts/generate-production-secrets.mjs` | JWT, VAPID, admin password |
| `scripts/setup-github-secrets.ps1` | GitHub Actions secrets |
| `.github/workflows/deploy-jethost.yml` | Auto-deploy on push |

---

## Проверка

- `https://TEMP-URL/` — сайт
- `https://TEMP-URL/admin` — админ
- `https://TEMP-URL/health` — `{"ok":true}`

Admin: `Rado` + паролата от output на `secrets:prod` или `.env.production.local`

---

## pamporovovilla.com (по-късно)

1. DNS → JetHost
2. cPanel SSL
3. Node.js App URL → `pamporovovilla.com`
4. Обнови `SITE_URL` в `.deploy.env` → `pnpm deploy:remote`

---

## Ръчен deploy на сървъра

```bash
cd ~/pamporovo-villa && git pull && bash scripts/deploy.sh
```

---

## Проблеми

| Симптом | Решение |
|---------|---------|
| 503 / бяла страница | cPanel → Node.js App → **Restart** |
| DB error | Провери `DATABASE_URL`, пусни `pnpm db:sync` по SSH |
| SSH failed | cPanel → SSH Access, ключ в `.deploy.env` |
| Admin не влиза | парола в `.env.production.local` на сървъра |
