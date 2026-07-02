# План: свързване на pamporovovilla.com с JetHost

Сайтът вече работи на JetHost на временен URL. Този документ описва как да насочиш **реалния домейн** към новия хостинг и какво да направиш след това (SSL, Mailjet, deploy).

---

## Общ план (ред на действията)

```
1. Ти (JetHost)          → подготви домейна в cPanel
2. Човекът (Namecheap)   → смени DNS да сочи към JetHost
3. Изчакване             → 1–24 часа (DNS propagation)
4. Ти (JetHost)          → SSL + Node.js URL + restart
5. Ти (код)              → SITE_URL + deploy + Mailjet
```

**Текущи данни (JetHost):**

| | |
|---|---|
| cPanel | https://eu1001.jethosting.com:2083/ |
| cPanel user | `vjlxjaxe` |
| SSH host | `eu1001.jethosting.com` (port 1022) |
| Node.js app root | `pamporovo-villa` |
| Startup file | `dist/index.js` |
| Временен URL (сега) | https://gregarious-green-pelican.51-77-93-92.cpanel.site |
| Целеви домейн | `pamporovovilla.com` |

---

## ЧАСТ 1 — JetHost (cPanel) — правиш ти

### Стъпка A — Запиши IP адреса на сървъра

1. Влез в cPanel: https://eu1001.jethosting.com:2083/
2. Отвори **Server Information** (или виж **Shared IP Address** горе вдясно)
3. Запиши IP-то (пример: `51.77.93.92` — **ползвай точното от cPanel**)
4. Изпрати го на човека с Namecheap — нужен е за A record

---

### Стъпка B — Добави домейна в cPanel

1. cPanel → **Domains** (или **Addon Domains**)
2. **Create / Add Domain**
3. Domain: `pamporovovilla.com`
4. Document root: default е OK — Node.js app-ът е в `~/pamporovo-villa/`, не в `public_html`
5. **Submit**

Ако cPanel иска отделно — добави и `www.pamporovovilla.com`, или ще се оправи с CNAME/redirect по-късно.

---

### Стъпка C — Свържи Node.js app-а с домейна

1. cPanel → **Software** → **Setup Node.js App**
2. Edit (молив) на app **pamporovo-villa**
3. **Application URL** → смени от временния subdomain на:
   ```
   pamporovovilla.com
   ```
4. **Save** — **Restart засега не** (първо DNS трябва да проработи)

---

### Стъпка D — След като DNS проработи

1. cPanel → **SSL/TLS Status** → **Run AutoSSL**
2. Изчакай сертификат за `pamporovovilla.com` и `www`
3. **Setup Node.js App** → **Restart**
4. Провери: https://pamporovovilla.com/health — трябва да върне OK
5. Провери: https://pamporovovilla.com/admin

---

### Стъпка E — Обнови SITE_URL и deploy

В `.env`:

```env
SITE_URL=https://pamporovovilla.com
```

После едно от двете:

```bash
pnpm deploy:remote
```

или обнови GitHub Secret `SITE_URL` и push to `main`:

```bash
pnpm deploy:github-secrets
# или без gh CLI:
pnpm deploy:github-secrets:print
```

---

## ЧАСТ 2 — Namecheap — за човека с достъп до домейна

> Copy-paste секцията по-долу и изпрати на човека с Namecheap достъп.  
> Попълни `[IP_ОТ_JETHOST]` с реалното IP от cPanel (Стъпка A).

---

**Тема: Преместване на pamporovovilla.com към нов хостинг**

Здравей,

Трябва да насочиш домейна **pamporovovilla.com** от стария хостинг към новия (JetHost).

**Нужно е само едно — промяна на DNS записите в Namecheap.**

### Вход

1. https://www.namecheap.com → Login
2. **Domain List** → **pamporovovilla.com** → **Manage**
3. Tab **Advanced DNS**

### Какво да изтриеш (старият хостинг)

Изтрий/премахни записи, които сочат към **стария** сървър:

- стари **A Record** (@ и www)
- стари **CNAME** за www
- **URL Redirect** към стария сайт (ако има)

*(Направи screenshot преди да триеш, за всеки случай.)*

### Какво да добавиш (новият JetHost)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| **A Record** | `@` | `[IP_ОТ_JETHOST]` | Automatic |
| **CNAME** | `www` | `pamporovovilla.com` | Automatic |

**Пример** (смени IP-то с реалното от cPanel):

```
A     @      51.77.93.92
CNAME www    pamporovovilla.com.
```

### Nameservers — НЕ ги пипай

- Остави **Namecheap BasicDNS** (или каквото е сега)
- **Не** сменяй nameservers на JetHost, освен ако JetHost support не каже друго
- Променяме **само** A + CNAME записите по-горе

### След промяната

- Сайтът може да не работи 1–24 часа (нормално — DNS propagation)
- **Не** анулирай стария хостинг веднага — изчакай новият сайт да тръgne
- Кажи когато си готов

Благодаря!

---

## ЧАСТ 3 — Mailjet (след като домейнът работи)

Докато домейнът не сочи към JetHost, **не** можеш да верифицираш `pamporovovilla.com` в Mailjet.  
След като `https://pamporovovilla.com` отваря сайта:

### Опция 1 — Файл на сайта (по-лесно)

1. В Mailjet → **Senders & Domains** → **Domains** → `pamporovovilla.com`
2. Качи **празен** файл в cPanel File Manager → `public_html/`:
   ```
   c44c93bef9b888fb4839174b0cb67d91.txt
   ```
   *(името идва от Mailjet — при теб може да е различно; копирай точното от екрана)*
3. Провери в браузър: `https://pamporovovilla.com/c44c93bef9b888fb4839174b0cb67d91.txt`
4. Mailjet → **Validate my domain**
5. След успех — изтрий временния файл

### Опция 2 — DNS TXT (по-добре за deliverability)

В Namecheap → **Advanced DNS**:

| Type | Host | Value |
|------|------|-------|
| TXT | `mailjet._c44c93be` | `c44c93bef9b888fb4839174b0cb67d91` |

*(Host/Value — копирай точните от Mailjet екрана.)*

След domain validation Mailjet ще покаже **SPF** и **DKIM** — добави ги също в Namecheap.

### .env след Mailjet

```env
MAILJET_API_KEY=...
MAILJET_API_SECRET=...
MAIL_FROM_EMAIL=noreply@pamporovovilla.com
MAIL_FROM_NAME=Pamporovo Villa
SUPPORT_EMAIL=pamporovovillasupport@gmail.com
SMTP_REPLY_TO=pamporovovillasupport@gmail.com
```

Deploy / GitHub secrets → тествай от admin: **Изпрати карта по имейл**.

### Временен workaround (преди домейн)

Ако трябва имейл **преди** DNS:

1. Mailjet → **Sender addresses** → verify `pamporovovillasupport@gmail.com`
2. В `.env`: `MAIL_FROM_EMAIL=pamporovovillasupport@gmail.com`
3. След domain validation → върни `noreply@pamporovovilla.com`

---

## Често срещани проблеми

| Проблем | Причина | Решение |
|---------|---------|---------|
| Сайтът показва стария хостинг | DNS cache / propagation | Изчакай 1–24 ч; `ipconfig /flushdns` (Windows) |
| `www` не работи | Липсва CNAME | Namecheap: CNAME `www` → `pamporovovilla.com` |
| HTTPS / certificate error | SSL още не е издаден | cPanel → SSL/TLS → Run AutoSSL (след DNS) |
| 503 Service Unavailable | Node app не е стартиран | Setup Node.js App → Restart |
| Mailjet validation fail | Домейн не сочи към JetHost | Първо DNS, после validation |
| Имейл в Spam | Липсва DKIM/SPF | Добави DNS записите от Mailjet |

---

## Checklist

### Преди DNS смяна
- [ ] IP записано от cPanel
- [ ] Домейн добавен в cPanel → Domains
- [ ] Node.js Application URL → `pamporovovilla.com` (saved)
- [ ] Съобщение изпратено на Namecheap човека

### След DNS propagation
- [ ] https://pamporovovilla.com/health работи
- [ ] https://pamporovovilla.com/admin работи
- [ ] HTTPS (зелено катинарче)
- [ ] AutoSSL активен
- [ ] Node.js App → Restart

### Код и имейл
- [ ] `SITE_URL=https://pamporovovilla.com` в `.env`
- [ ] Deploy или GitHub Secrets обновени
- [ ] Mailjet domain validated
- [ ] SPF + DKIM в Namecheap
- [ ] Тест: имейл с confirmation card от admin

### Финал
- [ ] Старият хостинг анулиран (само след като всичко работи минимум няколко дни)

---

## Бележки

- **DNS смяната не премества файлове** — app-ът вече е на JetHost. Само казваш на интернет: „pamporovovovilla.com → JetHost IP“.
- App root е `~/pamporovo-villa/` (извън `public_html`) — това е правилно за Node.js.
- Подробности за deploy: [docs/DEPLOY-JETHOST.md](docs/DEPLOY-JETHOST.md)
- cPanel навигация: [docs/JETHOST-CPANEL-NAV.md](docs/JETHOST-CPANEL-NAV.md)
