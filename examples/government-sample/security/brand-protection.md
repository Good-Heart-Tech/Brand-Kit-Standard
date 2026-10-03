# Protecting the Brightwater County brand

Scammers copy government logos because residents trust them. Fake county
websites, fake bills for taxes, fines, or permits, and text-message scams are
the most common attacks on local governments. Hiding the logo does not stop
them. What stops them is making fake emails fail, spotting fake sites early,
and teaching residents one simple rule.

## The rule we tell residents

> Brightwater County will never ask you to pay by text message, gift card,
> wire transfer, or cryptocurrency. Official county websites end in
> brightwatercounty.example. If you are not sure, go to the website yourself
> or call the number on a county bill you already have.

- [ ] This message is on the home page, every payment page, and every bill
- [ ] It is printed on property tax statements, court fine notices, and permit invoices
- [ ] It is posted on county social media accounts at least once a quarter
- [ ] It is translated into Spanish

## Fake government websites

- [ ] Every county website and service uses the official domain (no look-alike domains for campaigns or events)
- [ ] Payment pages for taxes, fines, and permits are only on the official domain or a vendor page linked from it
- [ ] We check for look-alike domains every month (for example with the free tool dnstwist)
- [ ] We registered the obvious typos of our domain
- [ ] We know which domains we own, who manages them, and when they renew

## Fake payment requests (taxes, fines, permits)

- [ ] Bills and notices explain how to check that they are real
- [ ] Staff never ask residents to pay by phone call they started, text, or gift card
- [ ] The payment vendor confirms changes to bank details only through a known contact
- [ ] Residents can look up any bill on the official website before they pay

## Text-message scams

- [ ] The County sends texts only from one published short code or number
- [ ] County texts never include payment links; they tell residents to visit the official website
- [ ] The short code and this rule are listed on the official website
- [ ] Residents know to forward scam texts to 7726 (SPAM) and report them to the County

## Email

- [ ] SPF, DKIM, and DMARC are set up for every county email domain
- [ ] DMARC is set to "reject" (fake emails using our domain get blocked)
- [ ] Someone reads the DMARC reports, or a tool summarizes them
- [ ] Domains we own but do not send email from have "no email" SPF and DMARC records
- [ ] We use the .gov domain program if eligible (free for local governments in the United States)

## Accounts

- [ ] Multi-factor authentication (MFA) is on for email, social media, the website, and payment systems
- [ ] Official social media accounts are verified where the platform allows it
- [ ] Shared social media passwords live in a password manager, not a spreadsheet

## The seal

- [ ] The seal file is only in `assets/seal/` and is not in the partner bundle
- [ ] Departments know the seal is for official documents only

## If someone impersonates us

1. Do not reply to or click anything in the fake message.
2. Post a warning on the official website and social media accounts, in English and Spanish.
3. Report fake websites to Google Safe Browsing and Microsoft (search "report phishing site").
4. Report the domain to its registrar's abuse contact (find it with a WHOIS lookup).
5. Report fake social accounts through the platform's impersonation form.
6. For fake payment requests, notify the county attorney and local law enforcement.
7. Tell residents where to report scams: https://brightwatercounty.example/report-fraud

## What we share, and why it is safe

Our colors and logo are already public on our website. Sharing them with
partner agencies, vendors, and the press does not make impersonation easier.
We do **not** share the county seal, bill and notice templates, payment page
designs, email or text templates, staff contact lists, or internal naming
notes. `obks validate` warns if any of those are marked for sharing in
`brandkit.yaml`.
