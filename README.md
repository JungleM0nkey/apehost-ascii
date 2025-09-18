# ASCII Art Studio

![ASCII Art Studio Logo](ASCII-LOGO-CLEAN.png)

ASCII art generator deployed on Cloudflare Workers. Transform text and images into ASCII art with multiple styles and export formats.
## Links
 [Demo App](https://ascii.apehost.net)
 
## Features

- **Text to ASCII**: Convert text using various font styles
- **Image to ASCII**: Transform images with drag & drop support
- **Multiple Export Formats**: TXT, HTML, JSON, Markdown
- **6 Color Themes**: Orange Fire, Matrix Green, Cyber Blue, and more
- **Real-time Preview**: See results as you type
- **Keyboard Shortcuts**: Ctrl+C (copy), Ctrl+G (generate)



## Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI

### Installation
```bash
# Clone the repository
git clone https://github.com/JungleM0nkey/apehost-ascii.git
cd apehost-ascii

# Install dependencies
npm install

# Login to Cloudflare (if not already logged in)
wrangler login
```

### Development
```bash
# Start local development server
npm run dev

# Preview with Cloudflare Workers runtime
npm run preview
```

Visit `http://localhost:8787` to see the application.

### Deployment

#### 1. Configure Account
Update `wrangler.toml` with your account details:
```toml
account_id = "your-account-id"
```

#### 2. Deploy to Staging
```bash
npm run deploy:staging
```

#### 3. Deploy to Production
```bash
npm run deploy
```

### Custom Domain Setup
1. Add your domain to Cloudflare
2. Update `wrangler.toml` routes section:
```toml
[env.production]
routes = [
  { pattern = "yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## Customization

### Adding New Themes
Edit `public/css/themes.css`:
```css
[data-palette="custom"] {
    --primary: #your-color;
    --secondary: #your-secondary;
    /* ... other variables */
}
```

### Adding New Fonts
Extend `public/js/generators/text.js`:
```javascript
this.fonts.set('newfont', {
    height: 6,
    chars: {
        'A': ['line1', 'line2', /* ... */],
        // ... other characters
    }
});
```


## Configuration

### Environment Variables
Set in `wrangler.toml`:
```toml
[vars]
ENVIRONMENT = "production"
DEBUG_MODE = "false"
```

### Rate Limiting
Configure in worker if needed:
```javascript
// In src/worker.js
const rateLimiter = {
    limit: 100,
    window: 60000 // 1 minute
};
```

## Monitoring

View logs in real-time:
```bash
# Production logs
npm run logs:production

# Staging logs
npm run logs:staging
```

