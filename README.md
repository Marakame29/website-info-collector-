# Lovable Scraper

A web application to scrape websites and extract content + images for easy duplication in Lovable.

## Features
- **One-Click Scraping**: Enter a URL and get a ZIP file.
- **Content Extraction**: Converts website structure to a clean Markdown/HTML hybrid format (`content.md`).
- **Image Downloading**: Automatically downloads (up to 20) images from the site.
- **Cloud Ready**: Designed for easy deployment on Railway.

## How to Deploy (Railway)

### Prerequisites
- A GitHub account.
- A Railway account (Free tier works).

### Steps
1. **Create a GitHub Repository**:
   - Create a new repository on GitHub.
   - Upload all the files from this folder to the repository.

2. **Deploy to Railway**:
   - Go to [Railway Dashboard](https://railway.app/).
   - Click "New Project" -> "Deploy from GitHub repo".
   - Select your new repository.
   - Railway will automatically detect the configuration (`railway.json` and `nixpacks.toml`) and start building.

3. **Enjoy**:
   - Once the build finishes, Railway will provide a URL (e.g., `https://lovable-scraper-production.up.railway.app`).
   - Open the URL and start scraping!

## Local Development (Optional)
If you want to run it locally (requires Node.js):
1. `npm install`
2. `npm start`
3. Open `http://localhost:3000`
