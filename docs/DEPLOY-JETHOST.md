# Деплой на JetHost (Maverick) — стъпка по стъпка

Проектът е **един Node.js app**: публичен сайт + админ панел (`/admin`) + API.

Домейн за production: **pamporovovilla.com** (свързва се по-късно).  
За първи тест ползвай **временния URL** от JetHost/cPanel.

---

## Фаза 0 — Локално (на твоя компютър)

### 0.1 Качи кода в GitHub (ако още не е там)

Repo: `https://github.com/Jhoseto/pamporovo-villa`

```bash
git add .
git commit -m "Add JetHost deployment setup"
git push origin main
```

### 0.2 Подготви production secrets (запиши ги на безопасно място)

**JWT secret** (мин. 32 символа):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**VAPID keys** (push известия в админ):

```bash
node scripts/generate-vapid.mjs
```

---

## Фаза 1 — JetHost cPanel (еднократна настройка)

### 1.1 Влез в cPanel

От JetHost клиентския панел → **Login to cPanel**.

### 1.2 Активирай SSH

cPanel → **SSH Access** → генерирай или качи SSH ключ.

- На Windows: PuTTY или `ssh user@server-ip` от PowerShell
- Запиши: **SSH host**, **username**, **port** (обикновено 22)

### 1.3 Създай MySQL база

cPanel → **MySQL Databases**:

1. Нова база: напр. `username_pamporovo`
2. Нов потребител + силна парола
3. Добави потребителя към базата с **ALL PRIVILEGES**

Connection string:

```
mysql://USERNAME:PASSWORD@localhost:3306/username_pamporovo
```

### 1.4 Намери временен URL (без pamporovovilla.com)

Докато DNS не е насочен, ползвай един от:

- **Primary domain** на акаунта (често нещо като `yourname.jethost.com`)
- или **Server Hostname** от cPanel (страница *Server Information*)

Този URL ще го сложиш в `SITE_URL` и в Node.js Application URL.

---

## Фаза 2 — Първи деплой по SSH

### 2.1 Свържи се и клонирай проекта

```bash
ssh USERNAME@SSH_HOST
cd ~
git clone https://github.com/Jhoseto/pamporovo-villa.git
cd pamporovo-villa
```

### 2.2 Създай `.env` на сървъра

```bash
cp .env.production.example .env
nano .env
```

Попълни поне:

| Ключ | Стойност |
|------|----------|
| `NODE_ENV` | `production` |
| `SITE_URL` | временният URL (https://...) |
| `DATABASE_URL` | mysql://... от стъпка 1.3 |
| `JWT_SECRET` | генерираният secret |
| `MASTER_ADMIN_USERNAME` | Rado |
| `MASTER_ADMIN_PASSWORD` | силна парола |
| `TRUST_PROXY` | `1` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | от generate-vapid |

Запази: `Ctrl+O`, Enter, `Ctrl+X`.

### 2.3 Инсталирай зависимости и build

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
bash scripts/deploy.sh
```

Скриптът прави: `pnpm install` → `pnpm build` → `pnpm db:sync` → създава `data/notification-sounds/`.

---

## Фаза 3 — cPanel Node.js App

### 3.1 Създай приложението

cPanel → **Setup Node.js App** → **CREATE APPLICATION**

| Поле | Стойност |
|------|----------|
| Node.js version | **22.x** |
| Application mode | **Production** |
| Application root | `pamporovo-villa` |
| Application URL | временният домейн (без pamporovovilla.com засега) |
| Application startup file | `dist/index.js` |

### 3.2 Environment variables (дублирай .env)

В същия екран → **Environment variables** → добави същите ключове като в `.env`.

> JetHost/cPanel често чете променливите от тук. Дръж `.env` и cPanel vars синхронизирани.

### 3.3 Стартирай

1. **Run NPM Install** (или вече си пуснал `pnpm install` по SSH)
2. **Restart** / **Start**

---

## Фаза 4 — Проверка

Отвори в браузър:

| URL | Очаквано |
|-----|----------|
| `https://TEMP-URL/` | Начална страница на сайта |
| `https://TEMP-URL/admin` | Админ login |
| `https://TEMP-URL/health` | `{"ok":true,"service":"pamporovo-villa"}` |

Влез в админ с `MASTER_ADMIN_USERNAME` / `MASTER_ADMIN_PASSWORD`.

---

## Фаза 5 — Автоматичен deploy от GitHub (след като първият deploy работи)

### 5.1 GitHub Secrets

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → New secret:

| Secret | Стойност |
|--------|----------|
| `JETHOST_SSH_HOST` | IP или hostname |
| `JETHOST_SSH_USER` | cPanel username |
| `JETHOST_SSH_KEY` | private SSH key (целият PEM) |
| `JETHOST_SSH_PORT` | `22` (ако е различен) |

### 5.2 Как работи

При всеки **push към `main`**:

1. GitHub Actions се свързва по SSH
2. `git pull` + `bash scripts/deploy.sh`
3. Restart на Node app (ако cloudlinux-selector е наличен)

Workflow файл: `.github/workflows/deploy-jethost.yml`

---

## Фаза 6 — Свързване на pamporovovilla.com (по-късно)

1. JetHost cPanel → **Domains** → добави `pamporovovilla.com`
2. При регистратора насочи DNS към JetHost nameservers
3. cPanel → **SSL/TLS** → AutoSSL за домейна
4. **Setup Node.js App** → смени Application URL на `pamporovovilla.com`
5. Обнови `SITE_URL=https://pamporovovilla.com` в `.env` и cPanel env vars
6. Restart Node app

---

## Бъдещи ъпдейти (ръчно)

```bash
ssh USERNAME@SSH_HOST
cd ~/pamporovo-villa
git pull origin main
bash scripts/deploy.sh
```

Или просто push към `main` — ако GitHub Actions е настроен.

---

## Често срещани проблеми

**Бяла страница / 503**  
→ cPanel → Setup Node.js App → **Restart**. Провери `dist/index.js` съществува (`pnpm build`).

**Database error**  
→ Провери `DATABASE_URL`. Пусни `pnpm db:sync`.

**Admin login не работи**  
→ Провери `MASTER_ADMIN_PASSWORD` в env. Seed се пуска автоматично при първо стартиране.

**Снимки липсват**  
→ `client/public/photos/` трябва да е в repo. Build копира в `dist/public/photos/`.

**Push известия не работят**  
→ VAPID keys + HTTPS (SSL). На iOS има ограничения.

---

## Файлове в проекта за деплой

| Файл | Роля |
|------|------|
| `scripts/deploy.sh` | Build + DB sync + restart |
| `.github/workflows/deploy-jethost.yml` | Auto-deploy от GitHub |
| `.env.production.example` | Шаблон за production env |
| `.node-version` | Node 22 |
| `server/_core/paths.ts` | Коректни пътища след build |
| `/health` | Бърза проверка дали app-ът живее |
