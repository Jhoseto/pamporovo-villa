# Deploy to JetHost Maverick

## Архитектура

```
Local (Windows)          GitHub Actions           JetHost Server
───────────────          ──────────────           ──────────────
pnpm build          OR   pnpm build (runner)  →   dist/ + node_modules
dist/ + .env             tar upload via scp        apply-pending-schema
   ↓ scp                                           cloudlinux restart
deploy.sh                                          
```

---

## Еднократна настройка (само веднъж)

### 1. cPanel — MySQL база данни
1. Влез в **https://eu1001.jethosting.com:2083/**
2. **Databases → MySQL Database Wizard**
3. Създай: база `vjlxjaxe_pamporovo-villa`, user `vjlxjaxe_PamporovoVilla`, запомни паролата
4. Запиши `DATABASE_URL` в `.deploy.env`

### 2. cPanel — Node.js App
1. **Software → Setup Node.js App → Create Application**
   - Node.js version: **22**
   - Application mode: **Production**
   - Application root: `pamporovo-villa`
   - Application URL: избери временния subdomain (напр. `gregarious-green-pelican.51-77-93-92.cpanel.site`)
   - Startup file: `dist/index.js`
2. Натисни **Create**

### 3. Конфигурирай `.deploy.env`
```bash
cp .deploy.env.example .deploy.env
# Попълни: JETHOST_SSH_HOST, JETHOST_SSH_USER, DATABASE_URL, SITE_URL
```

### 4. SSH ключ (за deploy без парола)
```bash
pnpm ssh:setup
```

---

## Ръчен deploy от Windows

```bash
pnpm deploy:remote
```

Прави:
1. Генерира production secrets → `.env.production.local`
2. Билдва локално (`pnpm build`) — `dist/`
3. SSH: `git pull` на сървъра
4. Качва `.env` и `dist/` via scp
5. Сървър: `deploy.sh` (db sync + restart)

> **Бележка:** Не се изпълнява `npm install` на сървъра — deps се качват от GitHub Actions или чрез бутона "Run NPM Install" в cPanel.

---

## Автоматичен deploy (GitHub Actions)

При всеки `git push main` → `.github/workflows/deploy.yml` автоматично:
- Инсталира всички deps на runner-а
- Билдва frontend + server
- Качва `dist/` + production `node_modules` + `.env` на сървъра
- Рестартира app-а

### Настройка на secrets (веднъж):
```bash
pnpm secrets:prod          # генерира JWT, VAPID, admin password
pnpm deploy:github-secrets # качва всичко в GitHub Secrets
```

Или ги добави ръчно в **GitHub → Settings → Secrets → Actions**:

| Secret | Откъде |
|--------|--------|
| `JETHOST_SSH_HOST` | `eu1001.jethosting.com` |
| `JETHOST_SSH_USER` | `vjlxjaxe` |
| `JETHOST_SSH_PORT` | `1022` |
| `JETHOST_APP_DIR` | `pamporovo-villa` |
| `JETHOST_SSH_KEY` | съдържанието на `~/.ssh/id_ed25519_jethost` |
| `DATABASE_URL` | от `.deploy.env` |
| `SITE_URL` | от `.deploy.env` |
| `JWT_SECRET` | от `.env.production.local` |
| `MASTER_ADMIN_PASSWORD` | от `.env.production.local` |
| `VAPID_PUBLIC_KEY` | от `.env.production.local` |
| `VAPID_PRIVATE_KEY` | от `.env.production.local` |

---

## Смяна на домейна

Когато искаш да активираш `pamporovovilla.com`:
1. В cPanel → Setup Node.js App → смени Application URL на `pamporovovilla.com`
2. При домейн регистратора: A record → IP на сървъра (вижда се в cPanel горе вдясно)
3. Смени `SITE_URL` в `.deploy.env` и в GitHub Secrets

---

## Проблеми

| Грешка | Причина | Решение |
|--------|---------|---------|
| `503 Service Unavailable` | App не е стартиран | cPanel → Setup Node.js App → Restart |
| `fork: Resource temporarily unavailable` | npm install изяжда nproc | Не пускай `npm install` по SSH; използвай GitHub Actions |
| `exec request failed` | Сървърът е без свободни процеси | Изчакай 10 мин или се обади на JetHost support |
| `Connection closed port 1022` | fail2ban след много неуспешни опита | Изчакай 10 мин |
