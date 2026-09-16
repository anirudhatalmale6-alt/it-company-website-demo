# Xervix — xervix.com.au

Five-page informational website for Xervix, an Australian technology company
covering managed IT, cyber security, AI, IoT and technology products.

**Preview:** https://anirudhatalmale6-alt.github.io/it-company-website-demo/

## Pages
- `index.html` — home
- `about.html` — About, including the six-step Xervix Client Process
- `services.html` — the four service capabilities
- `products.html` — the six product ranges
- `contact.html` — enquiry form

## Status
- About Us copy and the Client Process are the client's own words, used verbatim
- Services and Products wording is draft, awaiting client approval
- Logo is a placeholder wordmark; the real logo is still being created
- No phone number or postal address yet — deliberately absent rather than invented
- Contact form posts to `send.php`, which emails Sales@Xervix.com.au. On a
  static preview (no PHP) the form says so plainly instead of pretending to send

## Contact form
`send.php` handles the enquiry: server-side validation, honeypot, mail-header
injection guard, and a local `enquiries.log` fallback if the host's mail() fails
so nothing is lost. Needs PHP — any standard shared host, GoDaddy included.
If mail() is blocked, swap in SMTP; nothing else changes.

## Build
Hand-written HTML/CSS/vanilla JS. No framework, no build step.
Responsive, SEO meta per page, Open Graph, JSON-LD, sitemap and robots.

```
python3 -m http.server 8000
```
