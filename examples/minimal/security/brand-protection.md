# Protecting the Minimal Brand brand

Scammers can copy a logo from a website in seconds, so hiding the logo does not
stop them. What stops them is making fake emails fail and spotting fake sites
early. Work through this list with whoever runs your IT and check items off as you go.

## Email (most important)

- [ ] SPF, DKIM, and DMARC are set up for our email domain
- [ ] DMARC is set to "reject" (fake emails using our domain get blocked)
- [ ] Someone reads the DMARC reports, or a tool summarizes them
- [ ] Domains we own but do not send email from have "no email" SPF and DMARC records

## Look-alike websites

- [ ] We know which domains we own and when they renew
- [ ] We check for look-alike domains a few times a year (for example with the free tool dnstwist)
- [ ] We registered the obvious typos of our name, if they are cheap

## Accounts

- [ ] Multi-factor authentication (MFA) is on for email, social media, the website, and payment or billing tools
- [ ] Shared social media passwords live in a password manager, not a spreadsheet

## People

- [ ] Staff know: we never ask for gift cards, wire transfers, or payment changes by email or text
- [ ] Customers (or clients, members, residents, donors) are told the same thing on our website, invoices, and receipts
- [ ] There is one clear way to report impersonation: a contact page or a security.txt file on our website

## Optional, later

- [ ] BIMI: shows our verified logo next to our emails in Gmail and Yahoo (needs DMARC set to "reject" and a paid certificate)

## If someone impersonates us

1. Do not reply to or click anything in the fake message.
2. Report fake websites to Google Safe Browsing and Microsoft (search "report phishing site").
3. Report the domain to its registrar's abuse contact (find it with a WHOIS lookup).
4. Report fake social accounts through the platform's impersonation form.
5. Warn staff and the people you serve (customers, clients, members) if the scam is spreading.

## What we share, and why it is safe

Our colors and a basic logo are already public on our website. Sharing them with
partners or the press does not make impersonation easier. We do **not** share
email or signature templates, login, payment, or donation page designs, staff contact
lists, or internal names. `bkr validate` warns if any of those are marked for
sharing in `brandkit.yaml`.
