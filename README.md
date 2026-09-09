# IT Company Website — demo build

A four-page informational website for Xervix, built as a working sample.
Two themes: the light build at the root, the original dark build under `/dark/`. All copy, figures and contact details are **placeholder** and marked as
such by the banner at the top of every page.

**Live demo:** https://anirudhatalmale6-alt.github.io/it-company-website-demo/

## Pages
- `index.html` — home
- `about.html` — About Us
- `services.html` — Services
- `contact.html` — Contact Us (validated form)

## What's in it
- Hand-written HTML / CSS / vanilla JS — no framework, no build step, no jQuery
- Fully responsive (mobile nav, fluid type, single-column reflow at 720px)
- Contact form: inline validation, honeypot spam trap, accessible error messages
- SEO: unique title/description per page, canonical tags, Open Graph, JSON-LD
  structured data, semantic headings, `sitemap.xml`, `robots.txt`
- Accessibility: skip link, focus styles, ARIA on the nav toggle and form errors,
  `prefers-reduced-motion` respected
- Loads in well under a second — three fonts and ~20KB of CSS, no images

## Running it
Static files. Open `index.html`, or:

```
python3 -m http.server 8000
```

The contact form is front-end only in this demo — on the live site it posts to a
mail handler or CRM endpoint.
