# GitHub Upload Checklist

Use this before uploading files to GitHub Pages.

1. Upload from the `UPLOAD_TO_GITHUB` folder.
2. Always upload `index.html` when `app.js` or `styles.css` changes.
3. In `index.html`, confirm these two lines use the newest matching version:

```html
<link rel="stylesheet" href="styles.css?v=20260528-robot-copy" />
<script src="app.js?v=20260528-robot-copy"></script>
```

4. After GitHub finishes the commit, open the live site with a fresh URL:

```text
https://vkautomate.github.io/trump-ai/?fresh=1
```

5. If the old dashboard still appears, hard refresh the browser with `Ctrl + Shift + R`.

Quick health check:

- The page should show 7 sidebar nav items.
- The dashboard should show 6 landing cards.
- The page should not show broken encoding text such as stray `a`-accent sequences, `i`-accent sequences, or replacement boxes.
