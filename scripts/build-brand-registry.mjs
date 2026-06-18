/**
 * Regenerates assets/brand-registry.json from a curated domain list.
 * Run: node scripts/build-brand-registry.mjs
 */
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const MULTI_APEX = {
  "google.com": ["google.com", "youtube.com", "gmail.com"],
  "facebook.com": ["facebook.com", "meta.com", "instagram.com", "fb.com"],
  "meta.com": ["meta.com", "facebook.com", "instagram.com", "fb.com"],
  "microsoft.com": [
    "microsoft.com",
    "live.com",
    "office.com",
    "outlook.com",
    "microsoftonline.com"
  ],
  "apple.com": ["apple.com", "icloud.com"],
  "amazon.com": [
    "amazon.com",
    "amazon.co.uk",
    "amazon.de",
    "amazon.ca",
    "amazonaws.com"
  ],
  "paypal.com": ["paypal.com"],
  "x.com": ["x.com", "twitter.com", "t.co"],
  "spotify.com": ["spotify.com"],
  "shopify.com": ["shopify.com", "myshopify.com"],
  "openai.com": ["openai.com", "chatgpt.com"],
  "chatgpt.com": ["chatgpt.com", "openai.com"]
}

const DOMAINS = [
  "google.com",
  "youtube.com",
  "facebook.com",
  "amazon.com",
  "wikipedia.org",
  "twitter.com",
  "x.com",
  "instagram.com",
  "linkedin.com",
  "reddit.com",
  "netflix.com",
  "microsoft.com",
  "apple.com",
  "live.com",
  "office.com",
  "whatsapp.com",
  "tiktok.com",
  "pinterest.com",
  "ebay.com",
  "walmart.com",
  "craigslist.org",
  "paypal.com",
  "stripe.com",
  "github.com",
  "stackoverflow.com",
  "medium.com",
  "dropbox.com",
  "spotify.com",
  "twitch.tv",
  "discord.com",
  "zoom.us",
  "salesforce.com",
  "adobe.com",
  "oracle.com",
  "ibm.com",
  "intel.com",
  "nvidia.com",
  "samsung.com",
  "sony.com",
  "nike.com",
  "adidas.com",
  "target.com",
  "bestbuy.com",
  "homedepot.com",
  "costco.com",
  "etsy.com",
  "shopify.com",
  "aliexpress.com",
  "alibaba.com",
  "booking.com",
  "airbnb.com",
  "expedia.com",
  "uber.com",
  "lyft.com",
  "doordash.com",
  "grubhub.com",
  "chase.com",
  "bankofamerica.com",
  "wellsfargo.com",
  "citibank.com",
  "capitalone.com",
  "americanexpress.com",
  "discover.com",
  "visa.com",
  "mastercard.com",
  "coinbase.com",
  "binance.com",
  "robinhood.com",
  "fidelity.com",
  "schwab.com",
  "vanguard.com",
  "hulu.com",
  "disneyplus.com",
  "hbomax.com",
  "primevideo.com",
  "paramountplus.com",
  "peacocktv.com",
  "cnn.com",
  "bbc.com",
  "nytimes.com",
  "washingtonpost.com",
  "forbes.com",
  "bloomberg.com",
  "weather.com",
  "yahoo.com",
  "bing.com",
  "duckduckgo.com",
  "mozilla.org",
  "wordpress.com",
  "tumblr.com",
  "flickr.com",
  "imgur.com",
  "quora.com",
  "yelp.com",
  "indeed.com",
  "glassdoor.com",
  "monster.com",
  "coursera.org",
  "udemy.com",
  "khanacademy.org",
  "duolingo.com",
  "slack.com",
  "notion.so",
  "trello.com",
  "asana.com",
  "atlassian.com",
  "jira.com",
  "meta.com",
  "tiktok.com",
  "telegram.org",
  "signal.org",
  "proton.me",
  "protonmail.com",
  "icloud.com",
  "outlook.com",
  "gmail.com",
  "openai.com",
  "chatgpt.com",
  "anthropic.com",
  "claude.ai",
  "figma.com",
  "canva.com",
  "linear.app",
  "vercel.com",
  "cloudflare.com",
  "steam.com",
  "epicgames.com",
  "playstation.com",
  "xbox.com",
  "nintendo.com",
  "roblox.com",
  "minecraft.net",
  "substack.com",
  "patreon.com",
  "kickstarter.com",
  "go.com",
  "hbo.com",
  "max.com",
  "crunchyroll.com",
  "soundcloud.com",
  "bandcamp.com",
  "last.fm",
  "goodreads.com",
  "imdb.com",
  "rottentomatoes.com",
  "espn.com",
  "nfl.com",
  "nba.com",
  "mlb.com",
  "cvs.com",
  "walgreens.com",
  "fedex.com",
  "ups.com",
  "usps.com",
  "dhl.com",
  "aircanada.com",
  "delta.com",
  "united.com",
  "southwest.com",
  "marriott.com",
  "hilton.com",
  "vrbo.com",
  "kayak.com",
  "tripadvisor.com",
  "zillow.com",
  "realtor.com",
  "redfin.com",
  "nextdoor.com",
  "craigslist.org",
  "mercadolibre.com",
  "rakuten.com",
  "shein.com",
  "temu.com"
]

const seen = new Set()
const brands = []

for (const domain of DOMAINS) {
  const d = domain.toLowerCase()
  if (seen.has(d)) continue
  seen.add(d)

  const keyword = d.split(".")[0]
  if (keyword.length < 3) continue

  brands.push({
    keyword,
    officialApex: MULTI_APEX[d] ?? [d]
  })
}

/** Demo / product-specific brands for test pages */
const EXTRA_BRANDS = [
  {
    keyword: "pulse",
    label: "Pulse Audio",
    officialApex: ["pulseaudio.com"]
  }
]

for (const extra of EXTRA_BRANDS) {
  if (!seen.has(extra.keyword)) {
    brands.push(extra)
    seen.add(extra.keyword)
  }
}

brands.sort((a, b) => a.keyword.localeCompare(b.keyword))

const outPath = join(__dirname, "../assets/brand-registry.json")
writeFileSync(outPath, JSON.stringify(brands, null, 2) + "\n")
console.log(`Wrote ${brands.length} brands to ${outPath}`)
