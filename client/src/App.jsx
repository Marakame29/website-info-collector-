import { useState } from 'react';
import axios from 'axios';
import { Download, Loader2, Globe, CheckCircle, AlertCircle } from 'lucide-react';

function App() {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await axios.post('/api/scrape', { url }, {
                responseType: 'blob', // Important for handling ZIP file
            });

            // Create a URL for the blob
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', 'scraped-site.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();

            setStatus('success');
        } catch (error) {
            console.error('Scrape failed:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.error || 'Failed to scrape the website. Please check the URL and try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 ring-1 ring-indigo-500/20">
                        <Globe className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-purple-200">
                        Lovable Scraper
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Extract content and images to duplicate any website.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="url" className="text-sm font-medium text-slate-300 ml-1">
                                Website URL
                            </label>
                            <div className="relative">
                                <input
                                    type="url"
                                    id="url"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Scraping & Archiving...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Scrape Website
                                </>
                            )}
                        </button>
                    </form>

                    {/* Status Messages */}
                    {status === 'success' && (
                        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <h3 className="font-medium">Success!</h3>
                                <p className="text-sm text-emerald-400/80 mt-1">
                                    Your ZIP file has been downloaded. It contains the <code>content.md</code> and extracted images.
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <h3 className="font-medium">Error</h3>
                                <p className="text-sm text-red-400/80 mt-1">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500">
                    Designed for Lovable duplication workflow.
                </p>

            </div>
        </div>
    );
}

export default App;
