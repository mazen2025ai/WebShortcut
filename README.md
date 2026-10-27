# WebShortcut — AI + Software Company website

Modern replacement for the WordPress site at https://webshortcut.net/.
Single-page HTML5 + CSS + vanilla JavaScript, no framework and no build step.
Same visual family as DocMind and BrandMind: dark navy canvas, teal and blue accents.

## What is in the repo

```
index.html            The whole site (one page, anchored sections)
css/style.css         Design tokens + all styles
js/main.js            Nav, scroll reveal, counters, hero AI console animation, FAQ, contact form
send_email.php        Contact-form mailer (PHPMailer over Gmail SMTP)
config.example.php    Mail settings template → copy to config.php (gitignored)
composer.json         PHPMailer dependency (vendor/ is committed so FTP deploys work)
images/               Logo, hero and section photos reused from webshortcut.net
images/clients/       Nine client logos from the old Projects page
docs/                 Content migration notes and session logs
logs/                 Mail log (gitignored)
```

## Sections

Hero (with the animated "talk to your ERP" console) · Stats · Who we are · UNO.NET ERP modules and the UNO AI Assistant · AI Projects (data-to-AI pipeline, six project types, four delivery steps) · Solutions & Services · Projects and client logos · CTA · Leading Innovation checklist · About, timeline, pillars, support · FAQ · Contact · Footer.

## Run locally

WAMP serves the folder at http://localhost/WebShortcut/ . The page itself is static; only the contact form needs PHP.

```bash
cp config.example.php config.php   # then fill in SMTP_USER / SMTP_PASS / MAIL_RECIPIENTS
```

Append `?debug=1` to the URL to see client-side logs in the browser console.

## Deploy

Upload the repo root to `public_html/` (cPanel File Manager or FTP). Create `config.php` on the server by hand; it is never committed. Bump the `?v=` cache-busters on the CSS and JS links in `index.html` when either file changes.

## Content sources

- https://webshortcut.net/ (home, about, services, projects, FAQs, contact) — see `docs/CONTENT_MIGRATION.md` for what was kept, rewritten or dropped.
- UNO.NET Owner's Guide (the ERP manual) for the module descriptions.
- The UnoAI project for the AI Assistant facts (98 read-only queries, company-scoped, logged).
