# CLAUDE.md — WebShortcut Website
## Project: **WebShortcut — AI + Software Company marketing site**
## Owner: Mazen · Created: 2026-10-26

---

## 1. Golden Rules — MANDATORY

The coding rules live in `/Golden_Rules.md`. Read them at the start of every session and apply them to every request.

## 2. What this project is

The replacement for the WordPress site at https://webshortcut.net/ : a single-page HTML5 + CSS + vanilla JS marketing site that repositions WebShortcut as an **AI + Software company**. It sells the UNO.NET ERP (with the UNO AI Assistant), AI projects (unstructured data → intelligence, document intelligence, agents), and the classic services (web, mobile, hosting, design, maintenance, security).

Sister sites in the same visual family: DocMind (`C:\wamp64\www\DocMind`), BrandMind (`C:\wamp64\www\brandmind`). The design tokens in `css/style.css` match them on purpose. Do not switch to a framework or a build step.

## 3. Tech stack and files

```
Language:     HTML5, CSS3, vanilla JS (ES5-compatible style), PHP 7.4+ for the mailer only
Frameworks:   none · no bundler · fonts from Google Fonts · PHPMailer in vendor/
Local URL:    http://localhost/WebShortcut/
index.html    the page · css/style.css · js/main.js · send_email.php · config.example.php
images/       reused photos and the nine client logos · docs/CONTENT_MIGRATION.md explains every content decision
```

## 4. Conventions

- **Cache-bust** `css/style.css?v=` and `js/main.js?v=` in `index.html` whenever either file changes.
- **Logging:** client side via `mylog()` in `js/main.js` (visible with `?debug=1`); server side via `logEvent()` in `send_email.php` to `logs/email_errors.log`. Never swallow an exception silently.
- **Secrets:** SMTP credentials only in `config.php` (gitignored). `config.example.php` is the committed template.
- **AI vendor names:** keep public copy generic ("leading commercial models", "open models"). Do not name model vendors on the site.
- **Figures in the hero console are illustrative** and labelled "Illustrative data". Keep that label.
- **Facts about the ERP** come from the UNO.NET Owner's Guide and the UnoAI project (98 read-only tools, company-scoped, logged). Do not invent modules the ERP does not have.
- Responsive breakpoints: 1000px (nav collapses, grids go to 2 columns), 700/600px (single column). Check at 390, 768, 1024 and 1440 before pushing.

## 5. Git / deployment

- GitHub: https://github.com/mazen2025ai/WebShortcut · default branch `main`.
- Deployment is a hand upload of the repo root to `public_html/` (cPanel or FTP). `config.php` is created on the server by hand.
- Commit small and often, present-tense messages. Never commit `config.php` or `logs/`.
- Tell the owner to review at http://localhost/WebShortcut/ before pushing; push only when asked.

## 6. Open items

See "Facts to confirm with the owner" at the end of `docs/CONTENT_MIGRATION.md`.
