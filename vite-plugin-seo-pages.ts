// ---------------------------------------------------------------------------
// Build-time generator for the static SEO landing pages (approach C).
// Emits real crawlable HTML files into the build output AFTER Vite finishes,
// so the React SPA is untouched but each city/service has its own URL:
//   dist/areas/<slug>/index.html
//   dist/services/<slug>/index.html
//   dist/areas/index.html, dist/services/index.html  (hub pages)
//   dist/sitemap.xml                                  (regenerated)
// Runs on `vite build` only.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

import {
  CITIES,
  SERVICES,
  renderCityPage,
  renderServicePage,
  renderAreasIndex,
  renderServicesIndex,
  renderSitemap,
} from './seo/template';

export function seoPagesPlugin(): Plugin {
  let root = process.cwd();
  let outDir = 'dist';

  return {
    name: 'lsl-seo-landing-pages',
    apply: 'build',
    configResolved(config: ResolvedConfig) {
      root = config.root;
      outDir = config.build.outDir;
    },
    closeBundle() {
      const base = path.isAbsolute(outDir) ? outDir : path.join(root, outDir);

      const write = (relDir: string, html: string) => {
        const dir = path.join(base, relDir);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
      };

      // Hub pages
      write('areas', renderAreasIndex());
      write('services', renderServicesIndex());

      // City + service detail pages
      for (const city of CITIES) write(path.join('areas', city.slug), renderCityPage(city));
      for (const svc of SERVICES) write(path.join('services', svc.slug), renderServicePage(svc));

      // Regenerate sitemap with every URL (overwrites the placeholder from public/)
      fs.writeFileSync(path.join(base, 'sitemap.xml'), renderSitemap(), 'utf8');

      const count = 2 + CITIES.length + SERVICES.length;
      // eslint-disable-next-line no-console
      console.log(`\n[lsl-seo] generated ${count} static landing pages + sitemap.xml → ${outDir}/`);
    },
  };
}
