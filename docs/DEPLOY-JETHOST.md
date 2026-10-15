# Deploy to JetHost Maverick

## Env файлове (само 2)

| Файл | Какво съдържа |
|------|----------------|
| **`.env`** | Всичко за app-а: DB, пароли, SMTP (JetHost поща), VAPID, SITE_URL |
| **`.deploy.env`** | Само SSH: host, user, port, ключ |

Шаблони: `.env.example` и `.deploy.env.example`

```
copy .env.example .env
copy .deploy.env.example .deploy.env
```

---

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
4. Запиши `DATABASE_URL` в **`.env`**

### 2. cPanel — Node.js App
1. **Software → Setup Node.js App → Create Application**
   - Node.js version: **22**
   - Application mode: **Production**
   - Application root: `pamporovo-villa`
   - Application URL: избери временния subdomain (напр. `gregarious-green-pelican.51-77-93-92.cpanel.site`)
   - Startup file: `dist/index.js`
2. Натисни **Create**

### 3. Конфигурирай `.env` и `.deploy.env`
```bash
copy .env.example .env
copy .deploy.env.example .deploy.env
# .env → DATABASE_URL, SITE_URL, SMTP (JetHost), admin password
# .deploy.env → JETHOST_SSH_HOST, JETHOST_SSH_USER, JETHOST_SSH_KEY
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
1. Попълва липсващи secrets в `.env` (JWT, VAPID — без да пипа NODE_ENV)
2. Билдва локално (`pnpm build`) — `dist/`
3. SSH: `git pull` на сървъра
4. Качва production snapshot на `.env` и `dist/` via scp
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
pnpm secrets:prod          # попълва липсващи JWT/VAPID в .env
pnpm deploy:github-secrets       # needs gh CLI
pnpm deploy:github-secrets:print # без gh — показва какво да paste-неш в GitHub
```

Или ги добави ръчно в **GitHub → Settings → Secrets → Actions**:

| Secret | Откъде |
|--------|--------|
| `JETHOST_SSH_*` | `.deploy.env` |
| `DATABASE_URL` | `.env` |
| `SITE_URL` | `.env` |
| `JWT_SECRET` | `.env` |
| `MASTER_ADMIN_PASSWORD` | `.env` |
| `VAPID_*` | `.env` |
| `SMTP_*`, `MAIL_FROM_*`, `SUPPORT_EMAIL`, `MAIL_BCC` | `.env` (резервации + оферти от админ) |

---

## Имейл (JetHost cPanel)

Изпращане през **SMTP** (кутия в JetHost). Клиентът вижда **`pamporovovilla@gmail.com`** като From/Reply-To.

1. **cPanel → Email Accounts → Create** — напр. `oferta@pamporovovilla.com` + силна парола  
2. **Forwarders** (по избор): пренасочване към `pamporovovilla@gmail.com`  
3. В **`.env`** на сървъра (и GitHub Secrets при CI deploy):

   ```env
   SMTP_HOST=pamporovovilla.com
   SMTP_PORT=465
   SMTP_SECURE=1
   SMTP_USER=oferta@pamporovovilla.com
   SMTP_PASS=паролата_на_кутията
   MAIL_FROM_EMAIL=pamporovovilla@gmail.com
   MAIL_FROM_NAME=Pamporovo Villa
   SUPPORT_EMAIL=pamporovovilla@gmail.com
   SMTP_REPLY_TO=pamporovovilla@gmail.com
   MAIL_BCC=pamporovovilla@gmail.com
   ```

В админ: **Топ оферти → Изпрати по имейл**; при резервации — **Изпрати по имейл** (карта).

4. Ако домейнът още не сочи към JetHost, в cPanel → **Connect Devices** може да видите алтернативен hostname (напр. `*.jethosting.com`) вместо `mail.pamporovovilla.com`.

Официални настройки: [Set up email on your device](https://jethost.com/kb/set-up-email-on-your-device/) · портове: [Common hosting ports](https://jethost.com/kb/common-hosting-ports-on-jethost/).

---

## Локално с production DB (tunnel)

```bash
pnpm db:tunnel    # отваря SSH tunnel → localhost:3307
# В .env: DATABASE_URL=mysql://user:pass@127.0.0.1:3307/dbname
./restart.bat
```

---

## Смяна на домейна

Когато искаш да активираш `pamporovovilla.com`:
1. В cPanel → Setup Node.js App → смени Application URL на `pamporovovilla.com`
2. При домейн регистратора: A record → IP на сървъра (вижда се в cPanel горе вдясно)
3. Смени `SITE_URL` в `.env` и пусни `pnpm deploy:github-secrets`

---

## Проблеми

| Грешка | Причина | Решение |
|--------|---------|---------|
| `503 Service Unavailable` | App не е стартиран | cPanel → Setup Node.js App → Restart |
| `fork: Resource temporarily unavailable` | npm install изяжда nproc | Не пускай `npm install` по SSH; използвай GitHub Actions |
| `exec request failed` | Сървърът е без свободни процеси | Изчакай 10 мин или се обади на JetHost support |
| `Connection closed port 1022` | fail2ban след много неуспешни опита | Изчакай 10 мин |
