# Protect your brand from impersonation

## Does sharing our brand kit help scammers?

Mostly no. A scammer can copy your logo and colors from your website in a
couple of minutes. Sharing them with partners or the press adds almost no risk.

Some things **do** make a scammer's job easier, so keep them private:

| Keep private | Why |
|--------------|-----|
| Email and signature templates | Ready-made pieces for fake emails |
| Login, checkout, payment, or donation page designs | Exactly what phishing pages copy |
| Pricing, payment terms, invoices, or fundraising wording | Makes fake invoices and payment requests sound real |
| Staff names, titles, emails, phone numbers | Used for "this is your director, buy gift cards" scams |
| Internal names, vendors, unreleased campaigns | Makes fake requests sound believable |
| Original design files (AI, PSD, Figma) | Easier to forge invoices and letters |

When a kit is set to share (`partner` or `public`), `obks validate` warns if any
of these are on the list of shared files.

## What actually stops impersonation

These matter far more than whether your logo is public. Each kit has a checklist
at `security/brand-protection.md`; work through it with your IT partner.

### 1. Email authentication (most important)

SPF, DKIM, and **DMARC set to "reject"** tell Gmail, Outlook, and others to
block emails that pretend to come from your domain. Without this, anyone can
send email "from" you. Your IT partner can set it up in an hour or two, and free
DMARC report tools can summarize who is sending as you.

### 2. Watch for look-alike domains

Scammers register look-alike names, like `acme-1abs.com` for `acme-labs.com`. Check a few times a year (the
free tool dnstwist lists likely look-alikes), and consider registering the
cheapest obvious typos of your name.

### 3. Multi-factor authentication everywhere

Email, social media, your website, and any payment, billing, or donation tools. Most takeovers
start with a stolen password.

### 4. Tell people what you will never ask for

Put it on your website, invoices, receipts, and in staff onboarding:
"We will never ask you for gift cards, wire transfers, or payment changes by
email or text."

### 5. One place to report fakes

Give people one clear way to report a fake: a contact page on your website, or
a `security.txt` file (an internet standard, at `/.well-known/security.txt`).
This belongs on your website, not in the brand kit.

If you want shared bundles and the brand-at-a-glance page to point there, set
`contacts.security` in `brandkit.yaml` to that **URL**. It is optional, and we
recommend a URL over an email address so no inbox is copied into kit files.

### Optional: BIMI

BIMI shows your verified logo next to your emails in Gmail and Yahoo. It needs
DMARC set to "reject" plus a paid certificate, so it is usually a later step for
larger organizations.

## If you are impersonated

1. Do not reply to or click anything in the fake message.
2. Report fake websites to Google Safe Browsing and Microsoft's phishing report page.
3. Report the domain to its registrar's abuse contact (find it with a WHOIS lookup).
4. Report fake social accounts through each platform's impersonation form.
5. Warn staff and the people you serve (customers, clients, members, residents) if it is spreading.
6. Tell your IT partner so they can check your email settings.
