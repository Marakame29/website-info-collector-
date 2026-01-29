const puppeteer = require('puppeteer');
const archiver = require('archiver');
const { URL } = require('url');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Scrapes a website and streams a ZIP file to the response
 * @param {string} url - The URL to scrape
 * @param {import('express').Response} res - The response object to stream the ZIP to
 */
async function scrapeWebsite(url, res) {
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // Pipe archive data to the response
    archive.pipe(res);

    let browser;
    try {
       // Launch puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, 
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process' 
      ]
    });

        const page = await browser.newPage();

        // Set viewport to desktop
        await page.setViewport({ width: 1920, height: 1080 });

        // Navigate to URL
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        // 1. Get Metadata
        const title = await page.title();
        const description = await page.$eval('meta[name="description"]', element => element.content).catch(() => '');

        // 2. Extract Content (Simplified HTML/Markdown hybrid for Lovable)
        const content = await page.evaluate(() => {
            // Helper to clean text
            const cleanText = (text) => text ? text.replace(/\s+/g, ' ').trim() : '';

            // Get all important elements
            const elements = document.querySelectorAll('h1, h2, h3, p, li, a, img, button');
            let markdown = '';

            elements.forEach(el => {
                const tag = el.tagName.toLowerCase();

                if (tag === 'img') {
                    const src = el.src;
                    const alt = el.alt || 'Image';
                    if (src) markdown += `![${alt}](${src})\n\n`;
                } else if (tag === 'a') {
                    const href = el.href;
                    const text = cleanText(el.innerText);
                    if (text && href) markdown += `[${text}](${href})\n\n`;
                } else if (tag.startsWith('h')) {
                    const level = tag.replace('h', '');
                    const text = cleanText(el.innerText);
                    if (text) markdown += `${'#'.repeat(level)} ${text}\n\n`;
                } else if (tag === 'li') {
                    const text = cleanText(el.innerText);
                    if (text) markdown += `- ${text}\n`;
                } else {
                    const text = cleanText(el.innerText);
                    if (text) markdown += `${text}\n\n`;
                }
            });

            return markdown;
        });

        // 3. Extract Image URLs for downloading
        const imageUrls = await page.evaluate(() => {
            return Array.from(document.images).map(img => img.src).filter(src => src.startsWith('http'));
        });

        // Add Content File
        archive.append(`# ${title}\n\n${description}\n\n## Content\n\n${content}`, { name: 'content.md' });

        // 4. Download and Add Images
        // Limit to 20 images to prevent timeouts on free tiers
        const uniqueImages = [...new Set(imageUrls)].slice(0, 20);

        for (let i = 0; i < uniqueImages.length; i++) {
            const imgUrl = uniqueImages[i];
            try {
                const buffer = await downloadImage(imgUrl);
                const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
                const filename = `images/image-${i}${ext}`;
                archive.append(buffer, { name: filename });
            } catch (e) {
                console.error(`Failed to download image: ${imgUrl}`, e.message);
            }
        }

        // Finalize the archive (this finishes the stream)
        await archive.finalize();

    } catch (error) {
        console.error('Scraper internal error:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Status code: ${res.statusCode}`));
            }
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

module.exports = { scrapeWebsite };

