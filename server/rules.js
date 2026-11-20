const OFFICIAL_DOMAINS = [
  "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com",
  "axisbank.com", "paytm.com", "phonepe.com", "npci.org.in",
  "incometax.gov.in", "amazon.in",
];
const BRAND_KEYWORDS = ["sbi", "hdfc", "icici", "axis", "paytm", "phonepe", "npci", "incometax", "amazon"];
const BAD_TLDS = ["xyz", "top", "click", "tk", "ml", "ga", "cf", "gq", "icu", "buzz", "rest"];
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rb.gy", "is.gd", "goo.gl", "shorturl.at"];

export function extractUrls(text) {
  const re = /(https?:\/\/[^\s]+|(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
  return text.match(re) || [];
}

function getHostname(url) {
  try {
    const withProto = /^https?:\/\//i.test(url) ? url : "http://" + url;
    return new URL(withProto).hostname.toLowerCase();
  } catch {
    return null;
  }
}

const isOfficial = (host) =>
  OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith("." + d));

export function runRules(text) {
  const findings = [];
  const add = (id, points, reason) => findings.push({ id, points, reason });
  const lower = text.toLowerCase();

  // ---- Link checks ----
  for (const url of extractUrls(text)) {
    const host = getHostname(url);
    if (!host || isOfficial(host)) continue;

    const brand = BRAND_KEYWORDS.find((b) => host.includes(b));
    if (brand)
      add("brand_impersonation", 50,
        `The link "${host}" uses the name "${brand}" but is not the official website.`);

    const tld = host.split(".").pop();
    if (BAD_TLDS.includes(tld))
      add("suspicious_tld", 20, `The link ends in ".${tld}", which is often used in scams.`);

    if (SHORTENERS.includes(host))
      add("shortener", 15, "The link is shortened, so you cannot see where it really goes.");

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host))
      add("ip_link", 35, "The link uses a raw IP address instead of a website name.");

    if ((host.match(/-/g) || []).length >= 3)
      add("many_hyphens", 10, "The link has many hyphens, a common trick in fake websites.");
  }

  // ---- Text checks ----
  if (/\.apk\b|install (this )?app|download (the )?app/i.test(text))
    add("apk_download", 50, "The message asks you to install an app from a link. This is a common way to steal data.");

  if (/(share|send|tell|give).{0,20}(otp|pin|cvv|password)/i.test(text))
    add("asks_secret", 40, "The message asks for an OTP, PIN or password. Real banks never do this.");

  if (/anydesk|teamviewer|quicksupport|screen ?share/i.test(text))
    add("remote_access", 40, "The message asks you to install a remote-access app. Scammers use these to control your phone.");

  if (/(arrest|police|cbi|customs|narcotics|court|warrant|digital arrest)/i.test(text))
    add("threat", 30, "The message uses legal or police threats to scare you.");

  if (/(urgent|immediately|within \d+ ?(hours|hrs|minutes)|today only|last chance|blocked|suspended|expire)/i.test(text))
    add("urgency", 20, "The message creates pressure to act quickly.");

  if (/(lottery|you (have )?won|prize|lucky draw|cashback.*claim)/i.test(text))
    add("prize", 25, "The message promises a prize or reward, which is a typical bait.");

  // ---- Score ----
  const unique = [...new Map(findings.map((f) => [f.id + f.reason, f])).values()];
  const score = Math.min(100, unique.reduce((s, f) => s + f.points, 0));
  const level = score >= 60 ? "Dangerous" : score >= 25 ? "Suspicious" : "Safe";

  return { score, level, findings: unique };
}