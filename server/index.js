const express = require('express');
const cors = require('cors');
const path = require('path');
const { scrapeWebsite } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

app.post('/api/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log(`Starting scrape for: ${url}`);

        // Set headers for ZIP file download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="scraped-site.zip"`);

        await scrapeWebsite(url, res);

    } catch (error) {
        console.error('Scraping error:', error);
        // If headers haven't been sent, send JSON error
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to scrape website' });
        } else {
            // If stream started, we can't send JSON, strictly speaking, 
            // but the stream will end abruptly which client should handle.
            res.end();
        }
    }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
