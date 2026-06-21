Stackd — merge PDFs in your browser, free

A free, browser-only PDF merger. Add multiple PDFs, drag to reorder the
stack, split a file into pieces to insert another file partway through it,
and merge everything into one file — no upload, no file-count limit, no
watermark, and no account.

Built as a Digital Heroes developer trial submission by Mishti Agarwal
(mishtiagrawal02@gmail.com).

Why this tool

Most free online PDF mergers cap you at 2–3 files, watermark the output, or
require an email signup to unlock more — and all of them upload your files to
someone else's server first. Stackd does the merge entirely client-side using
pdf-lib, so your files never leave your device.
That matters whenever the PDFs being merged are scans, IDs, or anything
remotely private.

How merging works

The stack is made of page-range blocks, not whole files. By default each
added file is one block. Hitting Split on a block breaks it into two
independently-draggable blocks at whatever page you choose — drag a second
file's block between them and its pages land in the middle of the first
file's document, not just appended after it.

How it works


Plain HTML, CSS, and vanilla JavaScript — no framework, no build step.
PDF parsing and merging is done with pdf-lib, loaded from a CDN, running
fully in the browser.
No backend, no API calls, no database. The whole app is static files.


Run it locally

No build tooling is needed. From this folder, either:

bash# Option A: just open it
open index.html

# Option B: serve it (recommended, avoids file:// quirks)
python3 -m http.server 8000
# then visit http://localhost:8000

Deploy — GitHub + Vercel (both free)


Create the GitHub repo


bash   cd pdf-merge-tool
   git init
   git add .
   git commit -m "Stackd: free browser-based PDF merger"
   git branch -M main
   git remote add origin https://github.com/<your-username>/stackd-pdf-merger.git
   git push -u origin main

Make sure the repo is set to Public on GitHub (Settings → General →
Danger Zone → Change visibility, if it was created private).


Deploy on Vercel (Hobby/free plan)

Go to vercel.com → sign in with GitHub (free, no
card required).
Add New… → Project, select the stackd-pdf-merger repo.
Framework preset: Other (it's a static site — no build command, no
output directory needed).
Click Deploy. Do not enable any paid add-ons when prompted.
Once deployed, copy the live *.vercel.app URL.



Double-check before submitting

 Live Vercel URL opens and the merger actually merges PDFs.
 "Built for Digital Heroes" button is visible and links to
https://digitalheroesco.com.
 Name and email are visible on the page (footer).
 GitHub repo is public.
 No paid plan/card was used anywhere.





Project structure

pdf-merge-tool/
├── index.html   — markup
├── style.css    — visual design (carbon-copy / paper-stack theme)
├── script.js    — file intake, reorder, merge logic (pdf-lib)
└── README.md    — this file