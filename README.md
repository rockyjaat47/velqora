# Velqora

A React and Three.js website for Velqora’s B2B apparel service. It has a filterable catalog, front and back garment views, 25-piece sample request, courier comparison, SKU reorder planner, and seller policies.

## Run locally

Use Node.js 24.

```sh
npm ci
npm run dev
```

`npm run build` writes the static site to `dist/`. The GitHub Pages workflow builds and deploys when changes are pushed to `main`.

## Request and catalog data

Catalog SKUs, fabric details, shipping rates and reliability scores are illustrative. Sample and reorder requests are generated in the browser and can be downloaded by the visitor. The site has no server or form submission endpoint. Live orders require confirmed catalog and courier data, a secure submission backend, payment webhooks, and email and WhatsApp invoice integrations.

## Imagery

The studio hero and front and back apparel photos were generated with the built-in ImageGen tool. The hero depicts affordable everyday basics on a brass rail in a charcoal studio. The catalog depicts six unbranded garments in matching front and back photographic views. Optimized WebP files are in `public/images/`.
