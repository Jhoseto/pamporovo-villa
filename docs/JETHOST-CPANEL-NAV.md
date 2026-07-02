# JetHost cPanel — карта на интерфейса (Maverick)

Официални източници: [jethost.com/kb](https://jethost.com/kb/) · cPanel Jupiter theme · CloudLinux Node.js Selector

---

## 1. Вход в системата

### Client Area (фактури, планове)
| | |
|---|---|
| URL | **https://jethost.com/app/** |
| Login | Billing email + password |
| Welcome email | „Your Hosting Account is Ready“ — пази го |

### cPanel (управление на сайта)

**Начин A — препоръчителен (JetHost KB):**
1. https://jethost.com/app/ → Login
2. Dashboard → активен **Maverick** акаунт
3. **Manage**
4. **Log in to cPanel** (директен вход без втори парол)

**Начин B — директен URL:**
- С домейн: `https://pamporovovilla.com:2083`
- **Без DNS (сега):** `https://SERVERNAME.jethosting.com:2083`  
  (SERVERNAME е в welcome email-а)

> Port **2083** = secure cPanel (JetHost KB: Common Hosting Ports)

### cPanel search bar
Горе в cPanel има **Search**. Винаги можеш да напишеш:
- `Terminal`
- `Node.js`
- `MySQL`
- `SSH`
- `SSL`

---

## 2. cPanel секции (Jupiter theme)

```
┌─────────────────────────────────────────────────────────┐
│  [Search tools...]                          [User menu] │
├─────────────────────────────────────────────────────────┤
│  FILES          │  DATABASES        │  DOMAINS          │
│  · File Manager │  · MySQL Databases│  · Domains        │
│  · Terminal (*) │  · MySQL Wizard   │  · Redirects      │
│                 │  · phpMyAdmin     │                   │
├─────────────────┼───────────────────┼───────────────────┤
│  SOFTWARE       │  SECURITY         │  ADVANCED         │
│  · Setup        │  · SSH Access (*) │  · Terminal (*)   │
│    Node.js App  │  · SSL/TLS        │  · Cron Jobs      │
│  · MultiPHP Mgr │  · Imunify360     │                   │
└─────────────────────────────────────────────────────────┘
(*) Terminal може да е в Advanced; SSH keys — Security → SSH Access
```

---

## 3. MySQL — стъпки в cPanel

**Път:** Databases → **MySQL Database Wizard** (най-лесно)

| Стъпка | Екран | Действие |
|--------|-------|----------|
| 1 | Step 1 | Database name: `pamporovo` → cPanel добавя prefix → `username_pamporovo` |
| 2 | Step 2 | User + **Password Generator** → запиши паролата |
| 3 | Step 3 | **ALL PRIVILEGES** → Next |
| 4 | Done | Copy credentials |

**Connection string за `.env` (`DATABASE_URL`):**
```
mysql://USERNAME:PASSWORD@localhost:3306/username_pamporovo
```

**Host:** винаги `localhost` на JetHost shared (KB: MySQL Database Details)

**Алтернатива:** Databases → **MySQL Databases** → Current Databases table

---

## 4. SSH / Terminal

### Maverick включва SSH (developer tools)

**Опция A — cPanel Terminal (без PuTTY):**
1. Search → **Terminal** (или Advanced → Terminal)
2. „I understand and want to proceed“
3. Вече си в `~` (home directory)

**Опция B — SSH от Windows (за `pnpm deploy:remote`):**
```
Host: server hostname от welcome email
User: cPanel username
Port: 22 (ако не работи — пробвай 1022, JetHost SFTP port)
```

**SSH keys:** Security → **SSH Access** → Manage SSH Keys → Generate/Import

> Ако **Terminal** липсва → Live Chat на JetHost: „Enable SSH/Terminal for Maverick“

---

## 5. Setup Node.js App (CloudLinux Selector)

**Път:** Software → **Setup Node.js App**

### Първо създаване
1. **+ CREATE APPLICATION** (горе вдясно)
2. Попълни:

| Поле | Стойност за Pamporovo Villa |
|------|----------------------------|
| Node.js version | **22.x** (най-новият LTS) |
| Application mode | **Production** |
| Application root | `pamporovo-villa` |
| Application URL | primary domain от акаунта (временен URL) |
| Application startup file | `dist/index.js` |

3. **CREATE**

### След създаване — списък Web Applications

| Колона / бутон | Действие |
|----------------|----------|
| **Pencil icon** (Actions) | Edit application |
| **Run NPM Install** | Install dependencies (в edit екрана) |
| **Restart** | Рестарт след deploy |
| **Stop / Start** | Спиране/пускане |
| Info box (top) | `source ~/nodevenv/...` — virtual env command |

### Environment variables (в Edit екрана)
Scroll down → **Environment variables** → Add Variable:

```
NODE_ENV=production
DATABASE_URL=mysql://...
JWT_SECRET=...
MASTER_ADMIN_USERNAME=Rado
MASTER_ADMIN_PASSWORD=...
SITE_URL=https://...
TRUST_PROXY=1
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

**Save** → **Restart**

> `.env` от `pnpm deploy:remote` е на сървъра; cPanel env vars също трябва да са синхронизирани за Node selector.

---

## 6. Без pamporovovilla.com (сега)

DNS още не е насочен → ползвай:

1. **Primary domain** на акаунта (welcome email / cPanel → Domains)
2. Или **server hostname**: `https://SERVER.jethosting.com:2083` за cPanel
3. **Application URL** в Node.js → primary domain (не pamporovovilla.com)

Когато DNS е готов:
- Domains → добави `pamporovovilla.com`
- SSL/TLS → AutoSSL
- Node.js App → смени Application URL
- Update `SITE_URL` → `pnpm deploy:remote`

---

## 7. SSL

**Път:** Security → **SSL/TLS Status** или **Let's Encrypt SSL**

След DNS: AutoSSL активира HTTPS автоматично (Free SSL на Maverick).

---

## 8. File Manager (ако трябва ръчно)

**Път:** Files → **File Manager**  
Home directory → `pamporovo-villa/` → виж `dist/`, `.env`, `data/`

> App root **извън** `public_html` — правилно за Node.js.

---

## 9. Workflow за нашия проект

```
[Client Area] → Log in to cPanel
       ↓
[MySQL Wizard] → DATABASE_URL
       ↓
[Setup Node.js App] → CREATE (dist/index.js)
       ↓
[PC] pnpm deploy:remote  →  SSH upload + build
       ↓
[cPanel Node.js] → Restart
       ↓
https://TEMP-URL/health  ✓
```

---

## 10. JetHost support

- **24/7 Live Chat** на jethost.com
- KB: https://jethost.com/kb/
- Категории: Hosting, MySQL, Linux Commands, SSL

**Полезни KB статии:**
- [Log in to cPanel](https://jethost.com/kb/how-to-log-in-to-cpanel-at-jethost/)
- [MySQL Database Wizard](https://jethost.com/kb/how-to-use-mysql-database-wizard/)
- [MySQL details](https://jethost.com/kb/how-to-find-your-mysql-database-details-on-cpanel/)
- [Common Ports](https://jethost.com/kb/common-hosting-ports-on-jethost/) — 2083 cPanel, 1022 SFTP

---

## Maverick plan — relevant limits

| Ресурс | Maverick |
|--------|----------|
| Node.js apps | до **25** |
| Node versions | 6.17 – 22.x |
| MySQL DBs | **75** |
| SSH | ✅ |
| Git | ✅ |
| Backups | Daily |
| RAM | ~3 GB |
