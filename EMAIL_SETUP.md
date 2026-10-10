# 📧 QuickKart — Email / OTP Delivery Setup

Guide for configuring transactional email (signup OTP, password reset, order
confirmations, admin alerts) for the QuickKart backend.

The backend sends mail through **nodemailer**, so it works with any SMTP
provider. This guide uses **Brevo** (free tier) but the same steps apply to
Mailtrap, SendGrid, Amazon SES, etc. — just change the `.env` values.

---

## 🩺 Background: why emails were failing

Users were not receiving OTP emails even though the UI said "code sent."

Two separate problems caused this:

1. **Invalid SMTP credentials.** The former provider was Gmail, and its
   **App Password had been revoked/invalidated**. Gmail rejected every login:
   ```
   535-5.7.8 Username and Password not accepted ... (BadCredentials)
   ```
2. **Silent failure bug.** `config/mailer.js` caught send errors and returned
   `{ success: false }`, but the auth controller ignored that value and always
   responded with *"OTP sent to your inbox."* So failures were invisible.

Both are now addressed in code (see [Code changes](#-code-changes)).

---

## 🆓 Why Brevo

| Feature                      | Brevo Free plan              |
| ---------------------------- | ---------------------------- |
| Emails per day               | **300** (~9,000 / month)     |
| Contacts stored              | 100,000                      |
| Transactional (OTP) email    | ✅ Included                  |
| Credit card required         | ❌ No                        |
| Time limit                   | ❌ None (free forever)       |
| Catch                        | "Sent with Brevo" footer; requires account activation |

---

## 🚀 Setup

### 1. Create the account
1. Go to **https://www.brevo.com** → **Sign up free**.
2. Verify your email and complete the onboarding survey.
3. Stay on the **Free** plan.

### 2. Verify a sender address
Brevo only sends from addresses it has verified.
1. Top-right account menu → **Settings**.
2. **Senders, Domains & Dedicated IPs** → **Senders** tab.
3. **Add a sender** → e.g. Name `QuickKart`, Email `you@example.com`.
4. Enter the **6-digit code** Brevo emails to that address → status becomes **Verified**.

> If you later authenticate your own domain, individual sender verification is
> no longer required.

### 3. Activate transactional sending
New free accounts are not enabled for SMTP/transactional mail by default.
- If you hit `450 Your SMTP account is not yet activated`, open the **help/chat
  icon** in the Brevo header and create a ticket requesting activation.
- This is the only manual step and can take a few hours.

### 4. Generate an SMTP key
1. **Settings → SMTP & API → SMTP** tab.
2. Copy the **SMTP login** shown on the page
   (your account email, or something like `9xxxxxx@smtp-brevo.com`).
3. **Generate a new SMTP key** → name it (e.g. `QuickKart backend`) →
   **copy it immediately** (it is shown only once).

> ⚠️ Use the **SMTP key**, *not* an API key and *not* your account password.

### 5. Configure `backend/.env`
```env
# Provider: Brevo SMTP relay
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false

# SMTP_USER = your Brevo SMTP login (from the SMTP page)
SMTP_USER=your-brevo-smtp-login

# SMTP_PASS = your Brevo SMTP key (NOT an API key / account password)
SMTP_PASS=your-brevo-smtp-key

# Visible sender — MUST be a sender verified inside Brevo
EMAIL_FROM_NAME=QuickKart
EMAIL_FROM_ADDRESS=you@example.com

ADMIN_NOTIFICATION_EMAIL=you@example.com
```

> 🔒 **Never commit `.env`.** It is already listed in `.gitignore`.

### 6. Test it
Restart the backend, then from the `backend/` folder:

```bash
node scratch/test-smtp.js          # verify connection + authentication
node scratch/test-smtp.js --send   # verify + send a live test email
```

Expected output:
```
✅ SMTP connection + authentication verified
✅ Test email sent: <message-id> | 250 ...
```

---

## 🔧 Troubleshooting

| Symptom / error | Cause | Fix |
| --- | --- | --- |
| `535-5.7.8 Username and Password not accepted` | Wrong SMTP login/key, or using host `smtp-relay.brevo.com` as the *username* | Use the **SMTP login** as user and the **SMTP key** as pass |
| `450 Your SMTP account is not yet activated` | Transactional sending not enabled | Contact Brevo support to activate (Step 3) |
| Sender not verified | From-address not confirmed in Brevo | Verify the sender (Step 2), or `EMAIL_FROM_ADDRESS` must match it |
| `Connection timeout` on port 587 | Outbound 587 blocked (some hosts/clouds) | Try port **2525** (`SMTP_PORT=2525`, `SMTP_SECURE=false`) or **465** (`SMTP_SECURE=true`) |
| Emails land in **spam** | Sending from `@gmail.com` to Gmail recipients (Google/Yahoo 2024 sender rules) | Authenticate a domain in Brevo (see caveat below) |
| OTP API now returns 502 error | Email provider rejected the send | Check credentials/logs — this is the *intended* honest failure |

### ⚠️ Gmail-as-sender caveat
Sending from a `@gmail.com` address to Gmail recipients via a relay may be
treated as spam, and Brevo can rewrite the From address to a
`...m-sender-sib.com` alias. It usually still delivers, but for reliable
production delivery, **authenticate a domain you own** in Brevo
(Settings → Senders, Domains, IPs → Domains → add the DNS records).

---

## ☁️ Production (Vercel)

The deployed backend reads environment variables from **Vercel**, not from
`backend/.env`. Two rules cause most "works locally, fails in production" issues:

1. **Set every variable in Vercel** → Project → Settings → Environment
   Variables, with the **Production** scope ticked:

   | Key | Value |
   | --- | --- |
   | `SMTP_HOST` | `smtp-relay.brevo.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_SECURE` | `false` |
   | `SMTP_USER` | your Brevo SMTP login |
   | `SMTP_PASS` | your Brevo SMTP key |
   | `EMAIL_FROM_ADDRESS` | a sender **verified** in Brevo |
   | `EMAIL_FROM_NAME` | `QuickKart` |
   | `ADMIN_NOTIFICATION_EMAIL` | your real admin inbox |
   | `CLIENT_URL` | your live frontend URL (not localhost) |

2. **Env var changes only apply to a NEW deployment.** After editing them you
   must **Redeploy** (Deployments → ⋯ → Redeploy) or push a new commit —
   editing the variable alone will not update the running deployment.

> Vercel blocks outbound port **25** but allows **587** and **465**, so the
> default Brevo port works. If a send ever times out, try `SMTP_PORT=2525`.

---

## 🧩 Code changes

| File | Change |
| --- | --- |
| `backend/config/mailer.js` | Provider is now chosen purely by `SMTP_HOST` (removed Gmail auto-detection that hijacked `@gmail.com` logins). Added fail-fast timeouts and a separate `EMAIL_FROM_ADDRESS` for the visible sender. |
| `backend/utils/emailService.js` | `sendOtpEmail` now **throws** when the provider rejects a message, instead of silently succeeding. |
| `backend/controllers/authController.js` | No change needed — the thrown error now reaches the error handler, so the API returns an honest failure. |
| `backend/middleware/errorHandler.js` | Propagates `err.statusCode` and exposes the provider error as `details` (temporary diagnostic aid). |
| `backend/.env` | Switched to Brevo; previous Gmail values kept commented. |
| `backend/scratch/test-smtp.js` | Provider-agnostic SMTP diagnostic. |

---

## 🔁 Switching providers later

Because the mailer is provider-agnostic, changing providers is an `.env`-only change:

```env
# Mailtrap (great for local dev — captures mail, never delivers)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM_ADDRESS=no-reply@yourdomain.com
```
