# Claims, disclaimers, and approvals

Security, uptime, and compliance claims carry legal weight for a software
company: customers rely on them in contracts and security reviews. This file is
internal and is never shared with partners or the public.

## Required disclaimers

| When | Disclaimer text | Where it goes |
|------|-----------------|---------------|
| Any uptime figure | "Measured over [period]. See the status page for current and past uptime." | Same sentence or directly below |
| Any uptime commitment | "Service levels are defined in your service agreement." | Same page, linked to the agreement |
| AI features | "AI suggestions can be wrong. Review them before you publish." | In the product next to the feature, and on its help page |
| Prices on ads or landing pages | "Prices in USD. Taxes may apply. See the pricing page for current plans." | Same page, near the price |

## Words and claims we cannot use

These are legal and contract limits. Brand word choices belong in
`voice/terms.yaml` instead.

- **SOC 2:** SOC 2 is an audit report, not a certificate. Never say "SOC 2
  certified" or "SOC 2 compliant". We do not hold a SOC 2 report today, so we
  make no SOC 2 claim at all. If we complete an audit, the approved wording
  will be "Acme Labs has completed a SOC 2 Type II audit", and only while the
  report is current.
- **Uptime:** never "guaranteed uptime", "100% uptime", "always available", or
  "zero downtime". Quote a past uptime figure only with its period, from the
  status page.
- **Security:** never "unhackable", "bank-level security", "military-grade
  encryption", or "completely secure". Describe the actual control instead:
  "Data is encrypted in transit and at rest."
- **Compliance:** never "HIPAA compliant", "GDPR certified", or "FedRAMP"
  unless the legal team approves the exact wording in writing.
- **Results:** no percentages, time savings, or return on investment figures
  without a documented source listed in `identity/facts.md`.

## Who approves

| Content | Approver |
|---------|----------|
| Press releases | CEO and marketing lead |
| Ads and landing pages | Marketing lead |
| Security, uptime, or compliance wording | Security lead and legal team |
| Anything with numbers, results, or comparisons | Marketing lead and legal team |
| Service agreement language | Legal team |
