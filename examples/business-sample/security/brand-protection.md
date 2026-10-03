# Protecting the Ridgeline Coffee Roasters brand

Scammers can copy a logo from a website in seconds, so hiding the logo does not
stop them. What stops them is making fake emails fail, spotting fake shops
early, and teaching customers what we will never ask for. Work through this
list with your IT partner and check items off as you go.

## The scams we watch for

- **Fake online shops:** look-alike sites selling "Ridgeline" coffee at big
  discounts, then keeping the card details and never shipping
- **Gift card scams:** messages or social posts offering free gift cards, or
  "the owner" asking a staff member to buy gift cards for a vendor
- **Invoice fraud against wholesale customers:** fake invoices or "our bank
  details have changed" emails sent to restaurants and grocers that buy from us
- **Fake job and wholesale offers:** fake recruiter or "become a distributor"
  messages using our name

## What we tell customers

Put this on the website footer, order confirmations, wholesale invoices, and
the cafe gift card display:

> **We never ask for payment by email.** We never ask for gift cards, wire
> transfers, or new bank details by email, text, or social media. Our online
> shop is only at our main website. Wholesale bank details never change by
> email. If something looks off, use the contact page on our website before you
> pay.

## Email (most important)

- [ ] SPF, DKIM, and DMARC are set up for our email domain
- [ ] DMARC is set to "reject" (fake emails using our domain get blocked)
- [ ] Someone reads the DMARC reports, or a tool summarizes them
- [ ] Domains we own but do not send email from have "no email" SPF and DMARC records
- [ ] The online shop platform and accounting system send mail through our
      domain with DKIM, so real receipts and invoices pass DMARC

## Look-alike shops and domains

- [ ] We know which domains we own and when they renew
- [ ] We check for look-alike domains a few times a year (for example with the free tool dnstwist)
- [ ] We registered the obvious typos of our name, if they are cheap
- [ ] We search for our name plus "sale" or "discount" every month to spot fake shops
- [ ] Our shop platform's fraud and chargeback alerts go to a person who reads them

## Wholesale invoices

- [ ] Invoices come only from our accounting system, never from a personal mailbox
- [ ] Wholesale customers were told in writing that our bank details never change by email
- [ ] Any bank detail change is confirmed by phone, using a number already on
      file, by two people
- [ ] New wholesale accounts get this reminder in their welcome packet

## Gift cards

- [ ] Gift cards are sold only in the cafes and on our own shop
- [ ] Staff know: no manager or owner will ever ask them to buy gift cards
- [ ] We never run "free gift card" giveaways that ask for personal details

## Accounts

- [ ] Multi-factor authentication (MFA) is on for email, social media, the
      online shop, the point-of-sale system, the bank, and the accounting system
- [ ] Shared social media and shop logins live in a password manager, not a spreadsheet
- [ ] Former staff are removed from the shop, POS, and social accounts on their last day

## People

- [ ] Staff know: we never ask for gift cards, wire transfers, or payment changes by email or text
- [ ] Customers and wholesale buyers are told the same thing (see above)
- [ ] There is one clear way to report impersonation: the contact page on our
      website (`contacts.security` in `brandkit.yaml`)

## Optional, later

- [ ] BIMI: shows our verified logo next to our emails in Gmail and Yahoo (needs DMARC set to "reject" and a paid certificate)

## If someone impersonates us

1. Do not reply to or click anything in the fake message.
2. Report fake websites to Google Safe Browsing and Microsoft (search "report phishing site").
3. Report the domain to its registrar's abuse contact (find it with a WHOIS lookup).
4. Report fake shops that use our photos to the hosting provider and to the
   payment processor shown on the fake checkout page.
5. Report fake social accounts and ads through the platform's impersonation form.
6. If a wholesale customer may have paid a fake invoice, call them right away
   and tell them to contact their bank; speed matters for getting money back.
7. Post a short warning on our website and social accounts if the scam is spreading.

## What we share, and why it is safe

Our colors and logo are already on our website, our bags, and grocery shelves.
Sharing them in the press kit does not make impersonation easier. We do **not**
share pricing, wholesale terms, invoice or receipt designs, checkout or login
page designs, email templates, staff contact lists, or internal names.
`obks validate` warns if any of those are marked for sharing in `brandkit.yaml`.
