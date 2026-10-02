/**
 * Optional rule pack: Good Heart Tech / Honey House conventions on top of core BKR.
 * Any rule pack exports validate({ kitRoot, manifest, tokens }) and returns { errors, warnings }.
 * `tokens` is { base, themes, files } from the CLI (null when the tokens profile is off).
 */
export function validate({ manifest, tokens }) {
  const errors = [];
  const warnings = [];

  if (manifest.role === "product" && !manifest.hierarchy?.parent) {
    errors.push("GHT rule: product kits must declare hierarchy.parent");
  }

  const base = tokens?.base || [];
  const primary = base.find((t) => t.path === "palette.primary" || t.path === "color.primary");
  if (primary && !primary.token.description) {
    warnings.push("GHT rule: primary color should include a description");
  }
  for (const t of base) {
    if (t.token.inheritsFrom && manifest.role !== "product") {
      warnings.push(`GHT rule: token ${t.path} uses inheritsFrom but kit role is not product`);
    }
    if (t.token.type === "color" && !t.token.description) {
      warnings.push(`GHT rule: color ${t.path} should say what it is for (description)`);
    }
  }

  // Brand protection: client kits should name someone who receives impersonation reports.
  const security = manifest.contacts?.security;
  const visibility = manifest.publication?.visibility || "private";
  if (!security) {
    const msg = "GHT rule: add contacts.security so impersonation reports reach someone";
    if (visibility === "public") errors.push(msg);
    else warnings.push(msg);
  } else if (/@example\.(org|com|net)$/i.test(security) && manifest.brand.status === "active") {
    errors.push("GHT rule: contacts.security is still a placeholder (example.org) on an active kit");
  }

  if (manifest.validation?.minContrastRatio !== undefined && manifest.validation.minContrastRatio < 4.5) {
    warnings.push("GHT rule: minContrastRatio below 4.5 does not meet WCAG 2.2 AA for normal text");
  }

  return { errors, warnings };
}
