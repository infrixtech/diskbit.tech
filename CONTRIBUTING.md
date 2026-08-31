# Contributing to Diskbit

Thanks for your interest in contributing. Diskbit welcomes bug reports, fixes, and new tools.

## Ground rules

1. **Everything runs client-side.** Tools must work entirely in the browser with no network requests for processing. If a feature needs a server, it is out of scope for this project.
2. **Privacy claims must stay true.** Never add analytics, logging, or third-party requests that see user files or text.
3. **No stub tools.** A tool ships only when it works end to end, handles wrong inputs gracefully, and warns about very large files (> 50 MB).
4. **Keep it dependency-light.** Prefer web platform APIs (canvas, Blob, Web Workers). New dependencies need a strong justification in the PR description.
5. **Plain language.** Labels and errors should make sense to someone who is not a developer. Avoid jargon unless the tool is explained in the same sentence.

## Getting started

```bash
git clone https://github.com/infrixtech/diskbit.tech.git
cd diskbit.tech
npm install
npm run dev
```

## Reporting bugs

Open a GitHub issue with:

- The tool and the steps to reproduce.
- The browser and OS you used.
- If it involves a specific file, describe the file (type, size, source). Please don't attach sensitive documents.

## Adding a new tool

Follow the four steps in the [README](README.md#how-to-add-a-new-tool): registry entry, SEO content, component, slug mapping. Additionally:

- Reuse the shared components (`FileDropzone`, `DownloadButton`) and the visual patterns of existing tools. Consistent UI is a feature.
- Write real how-to steps and FAQs (~200 words total). They are rendered on the page and emitted as FAQPage structured data.
- Handle the unhappy paths: wrong file type, corrupted/encrypted files, empty input, absurd values.
- Test in at least two browsers, including one mobile viewport.

## Pull request checklist

- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` completes successfully
- [ ] New tools work in Chrome and Firefox, and are usable on a 375px-wide viewport
- [ ] Dark mode looks correct
- [ ] No new network requests during tool processing (check the DevTools Network tab)

## Code style

- TypeScript, strict mode. Avoid `any`.
- Tailwind for styling; follow the indigo accent + slate palette used everywhere.
- Small, focused components. Copy the structure of an existing similar tool rather than inventing a new pattern.

## Commit messages

Use short, imperative messages: `Add QR code generator`, `Fix aspect ratio lock rounding`. Reference issues where relevant (`Fixes #42`).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
