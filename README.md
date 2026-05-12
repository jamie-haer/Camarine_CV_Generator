# Camarine CV Submission Generator

Upload candidate CVs → AI strips contact details → generates a consistent cover page + formatted CV ready to print as PDF.

## Deploy to Netlify

### Option A — Drag & Drop (easiest)
1. Unzip this folder
2. Run `npm install && npm run build` to generate the `dist/` folder
3. Go to [netlify.com](https://netlify.com) → Add new site → Deploy manually
4. Drag the `dist/` folder into Netlify

### Option B — Connect Git repo
1. Push this folder to a GitHub repo
2. In Netlify: Add new site → Import from Git → select your repo
3. Build command: `npm run build`
4. Publish directory: `dist`

## Required: Set API Key

After deploying, add your Anthropic API key in Netlify:

1. Go to **Site settings → Environment variables**
2. Add variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your key from console.anthropic.com)
3. **Redeploy** the site for the variable to take effect

## Local Development

```bash
npm install
# Create .env file with:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

## How it works

1. Upload a PDF or Word CV
2. Claude AI extracts all candidate data, strips contact details
3. Review and edit the details
4. Preview cover page + formatted CV
5. Print / Save as PDF — both pages in one document
