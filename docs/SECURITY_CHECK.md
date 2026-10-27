# Security check against the boxmind.ai assessment findings

Date: 2026-10-27. Trigger: the external assessment of boxmind.ai (Hassan Alkora, 26 October 2026).
Scope: the live WordPress site **webshortcut.net** (Cloudflare in front, HostGator origin), the mail/ERP domain **unodotnet.com** (HostGator shared host, no Cloudflare), and the **new static site in this repo**.
Method: read-only external probes only (DNS lookups, HTTP requests, TLS handshakes, one MySQL banner read). No credential testing, no scanning tools, no authenticated access.

## 1. Same finding, same answer

| boxMind finding | webshortcut.net (live) | unodotnet.com | New site (this repo) |
|---|---|---|---|
| F-01 Open redirect via encoded back-slash | **Not present.** `/%5cexample.com/%2f%2e%2e` returns 404 | Not present (404) | No redirect logic exists; `.htaccess` now rejects any `\` or `%5c` path outright |
| F-02 No DMARC | **Same problem.** `_dmarc.webshortcut.net` has no record. SPF is soft-fail (`~all`), no DKIM selector found | **Same problem.** No DMARC, soft SPF, no DKIM | Not applicable (DNS) |
| 4.1 WHM / cPanel / Webmail on public hostname | **Same problem.** Ports 2087 (WHM Login), 2083 (cPanel Login), 2096 (Webmail Login) all answer on webshortcut.net, proxied by Cloudflare | **Same problem.** All three answer directly on the origin | Not applicable (host) |
| 4.2 cPanel build / CVE-2026-41940 | Unknown. Not determinable from outside; HostGator patches shared servers but confirm in WHM | Unknown, same | Not applicable |
| 4.3 MySQL 3306 reachable | Not reachable through the hostname (Cloudflare does not proxy 3306); origin IP not tested | **Worse.** 3306 answers with a `5.7.44-48` handshake (MySQL 5.7 is end-of-life) | Not applicable |
| 4.4 SMTP 587 exposed | Not tested | Not tested | Not applicable |
| 4.5 Unknown Host header | Clean: 403 | Server returns 500 for everything (site is broken) | Clean |
| 4.6 No DNSSEC | **Same problem.** No DS record (Cloudflare DNS, DNSSEC off) | **Same problem.** No DS (ns1/ns2.siteupnow.net) | Not applicable |
| 4.7 No security.txt | **Same problem.** 404 | 500 | **Fixed:** `.well-known/security.txt` added |
| 4.8 Contact form without rate limit | Unknown (Contact Form 7, not tested) | Site down | **Fixed:** 3 submissions per IP per 10 minutes, plus same-origin check and honeypot |
| Reflected XSS / CSRF on the form | Not tested | Site down | No reflection (JSON only, inputs escaped); same-origin check rejects cross-site POSTs |
| Sensitive files (.env, .git, backups, phpinfo) | Clean: all blocked or 404 | Mostly 500 (site down); `.env` blocked | **Fixed:** `.htaccess` denies config, logs, vendor, docs, markdown, json, .git |
| HTTPS enforcement | **Worse than boxMind.** `http://webshortcut.net/` serves the full page with status 200 and no redirect | Site down | **Fixed:** `.htaccess` redirects to HTTPS (Cloudflare-aware) |
| Security headers (HSTS, CSP, X-Frame-Options) | **Missing.** Only `Server: cloudflare` is sent | Site down | **Fixed:** HSTS, CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy |
| TLS versions | Clean: TLS 1.0 and 1.1 refused, 1.2 accepted | Not tested | Handled by the host |
| HTTP methods | Clean: TRACE returns 405 | Site down | **Fixed:** only GET, POST, HEAD pass the rewrite rules. TRACE itself is answered by the Apache core, so it relies on the host's `TraceEnable off` (cPanel default; Cloudflare also blocks it) |

## 2. Extra findings specific to the current WordPress site

- `wp-login.php` is public (200). Anyone can attempt logins; WordPress has no built-in lockout.
- `readme.html` is public and the page HTML discloses plugin versions: Elementor 3.29.1, Slider Revolution 6.7.18, Contact Form 7. Slider Revolution has a long history of exploited vulnerabilities; keep it updated or remove it.
- `xmlrpc.php` answers (405 on GET, so it exists). It is a common brute-force and amplification target.
- The REST users endpoint is protected (401). Good.

These disappear when the new static site replaces WordPress.

## 3. unodotnet.com is down and it is the contact mailbox

Every page on unodotnet.com returns HTTP 500, on both HTTP and HTTPS. The new site's contact form sends to info@unodotnet.com, and the domain's MX points at the same host. The test message on 2026-10-27 was confirmed at mazenlhm@gmail.com but delivery to info@unodotnet.com could not be verified. Check that mailbox, or add a second recipient that is known to work, before going live.

## 4. Actions only you can take (host and DNS level), in priority order

1. **Publish DMARC** for both domains. Start with `v=DMARC1; p=none; rua=mailto:dmarc@webshortcut.net` (and the same for unodotnet.com), review the reports for two weeks, then move to `p=quarantine` and later `p=reject`. Enable DKIM signing in cPanel (Email Deliverability page) so alignment does not rely on SPF alone. Consider tightening SPF from `~all` to `-all` once DKIM is on.
2. **Enforce HTTPS on webshortcut.net now.** In Cloudflare: SSL/TLS → Edge Certificates → *Always Use HTTPS* on, *HSTS* on, and set the encryption mode to *Full (strict)*. The new `.htaccess` also does this at the origin.
3. **Hide the control panels.** In Cloudflare, the proxied ports 2082/2083/2086/2087/2095/2096 can be blocked with a WAF rule unless the source IP is yours. On the HostGator side, ask support to restrict WHM/cPanel access by IP, and use a strong unique password plus two-factor authentication in cPanel.
4. **unodotnet.com:** fix the 500 error (likely a broken `.htaccess` or PHP version change on the HostGator account), and ask HostGator whether MySQL 3306 can be closed to the internet for that server. MySQL 5.7 is end-of-life.
5. **Enable DNSSEC** in Cloudflare for webshortcut.net (one click, then add the DS record at the registrar). For unodotnet.com, it depends on what siteupnow.net's DNS supports.
6. **Confirm the cPanel/WHM build** in WHM → Server Status. If it is below 11.136.0.7, raise it with HostGator because of CVE-2026-41940.
7. **Until the new site goes live:** update WordPress, Elementor, Slider Revolution and Contact Form 7, or install a login-lockout plugin and disable `xmlrpc.php`.

## 5. What was fixed in this repository today

- `.htaccess`: HTTPS redirect (Cloudflare-aware), method allow-list, back-slash path rejection, denial of config, logs, vendor, docs and metadata files, directory listing off, security headers including a Content-Security-Policy that allows only self, Google Fonts and the Google Maps frame.
- `.well-known/security.txt` with a contact and an expiry one year out.
- `send_email.php`: same-origin check on Origin/Referer, file-based rate limit of 3 submissions per IP per 10 minutes, honeypot kept, every rejection logged.

Verified locally on 2026-10-27: file and folder denials, the method allow-list, the back-slash rejection and directory-listing off all behave as intended through WAMP's Apache; the origin check returns 403 and the fourth submission in ten minutes returns 429 (no email was sent during the test); the Content-Security-Policy was injected in headless Chromium and produced no violations, with the Google Maps frame, Google Fonts, the hero console and the FAQ all working. The headers themselves could not be observed locally because WAMP ships with `mod_headers` and `mod_expires` commented out; both are enabled on cPanel hosts.

Re-run the probes after deployment: `curl -sI https://webshortcut.net/` should show the new headers, `curl -sI http://webshortcut.net/` should return a 301 to HTTPS, and `https://webshortcut.net/config.php` and `/logs/` should return 403 or 404.
