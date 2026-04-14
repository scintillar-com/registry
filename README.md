# @sntlr/registry

Scintillar UI — components and blocks built for live collaboration, with
React & Next. shadcn-compatible: every item is installable via the shadcn
CLI into any Next.js / Vite / Tanstack Start project.

Browse at **https://ui.sntlr.app** (served by
[`@sntlr/registry-shell`](https://www.npmjs.com/package/@sntlr/registry-shell)).

## Install a component

```bash
# any item — swap the slug
npx shadcn@latest add https://ui.sntlr.app/r/button.json
npx shadcn@latest add https://ui.sntlr.app/r/data-table.json
```

shadcn resolves imports, copies the source into your project, and installs
any direct deps. Components import `cn` from your own `@/lib/utils`,
never from this registry — nothing Scintillar-specific leaks into your app
at runtime.

## What's in here

| Area | Count | Location |
|---|---|---|
| Components | 43 | [`components/ui/`](components/ui/) |
| Blocks (composed examples) | 19 | [`registry/new-york/blocks/`](registry/new-york/blocks/) |
| Previews (for the shell's demo pages) | 43 | [`components/previews/`](components/previews/) |
| MDX docs (en + fr) | 14 | [`content/docs/`](content/docs/) |
| Metadata (a11y, tests, props) | — | [`public/a11y/`](public/a11y/), [`public/tests/`](public/tests/), [`public/props/`](public/props/) |
| Built registry JSON served at `/r/` | — | [`public/r/`](public/r/) |

## Local development

Requires Node ≥ 18.18 and pnpm 10.

```bash
pnpm install
pnpm shell        # boots the shell at localhost:3000 against this registry
```

The shell is `@sntlr/registry-shell` — a separate package that reads
[`registry-shell.config.ts`](registry-shell.config.ts) and serves the docs
site you see at ui.sntlr.app. Changes to `components/ui/`, `registry/`, and
`content/docs/` hot-reload automatically.

## Common commands

**Build the shadcn-consumable output:**
```bash
pnpm registry:build         # regenerates public/r/*.json
```

**Regenerate component metadata** (run after editing any component):
```bash
pnpm generate:all           # parallelizes props + a11y + tests
# or individually:
pnpm generate:props
pnpm generate:a11y
pnpm generate:tests
```

**Quality gates:**
```bash
pnpm validate               # shadcn registry manifest integrity
pnpm healthcheck            # component/doc/test/a11y coverage report
pnpm check:labels           # required-label enforcement
pnpm check:side-effects     # bundle-size regression guard
pnpm api:check              # fails if public API surface drifted
```

**Tests:**
```bash
pnpm test                   # vitest — unit + component tests
pnpm test:e2e               # playwright — full e2e suite
pnpm test:visual            # visual regression (screenshots under tests/e2e/)
pnpm test:a11y              # automated a11y audits
pnpm test:interaction       # user-interaction flows
```

All scripts are defined in [`package.json`](package.json).

## Repo layout

```
components/
  ui/                 — individual components (Button, Dialog, ...)
  previews/           — preview wrappers used by the shell's demo pages
registry/
  new-york/blocks/    — composed examples (forms, dashboards)
content/docs/
  en/                 — English docs
  fr/                 — French docs (fall back to en when a slug is missing)
public/
  r/                  — generated shadcn manifests served at /r/[name].json
  a11y/ tests/ props/ — per-component metadata JSON
scripts/              — generators, validators, healthcheck
tests/                — vitest (tests/unit) + playwright (tests/e2e)
```

## Authoring a new component

1. Drop the source at `components/ui/my-component.tsx`.
2. Write a preview at `components/previews/my-component-preview.tsx`
   and add it to the default export map in
   [`components/previews/index.ts`](components/previews/index.ts).
3. Write docs at `content/docs/en/my-component.mdx` (French optional).
4. Run `pnpm generate:all` to populate props + a11y + tests metadata.
5. Run `pnpm validate && pnpm healthcheck` to confirm nothing regressed.
6. Run `pnpm registry:build` to rebuild the shadcn manifest.
7. `pnpm shell` and visit `/components/my-component` to preview it.

## License

MIT
