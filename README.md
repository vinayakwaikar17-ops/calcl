# CalcPro Suite 🧮

A full-stack, production-ready calculator web application with 11 powerful calculators built with **Node.js + Express** backend and a sleek single-page frontend.

## ✨ Calculators Included

| Calculator | Features |
|---|---|
| 🧮 Basic Calculator | Arithmetic, trig functions, history, keyboard support |
| 🧾 GST Calculator | Add/Remove GST, CGST/SGST breakup, all slab rates |
| 💼 TDS Calculator | 8 payment categories, surcharge, education cess |
| 🏦 Loan / EMI | Monthly EMI, total interest, amortization schedule |
| 📊 Percentage | 5 modes: % of, what %, % change, add/subtract % |
| 🎂 Age Calculator | Exact age, total days, next birthday, zodiac sign |
| 📏 Height Converter | cm ↔ m ↔ ft ↔ in ↔ mm |
| 📐 Length Converter | mm, cm, m, km, in, ft, yd, mi, nautical miles |
| ⚖️ Weight Converter | kg, g, mg, lb, oz, metric tonne, stone |
| 🌡️ Temperature | °C ↔ °F ↔ K ↔ Rankine |
| 🔷 Area Calculator | Rectangle, circle, triangle, square, trapezoid |

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
open http://localhost:3000
```

For development with auto-reload:
```bash
npm run dev
```

## 📁 Project Structure

```
calculator-app/
├── server.js          # Express backend with all API endpoints
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── .gitignore
└── public/
    └── index.html     # Complete single-page frontend
```

## 🌐 API Endpoints

All endpoints accept `POST` with JSON body and return JSON.

| Endpoint | Body | Description |
|---|---|---|
| `POST /api/basic` | `{ expression }` | Evaluate math expression |
| `POST /api/gst` | `{ amount, rate, type }` | GST calculation |
| `POST /api/tds` | `{ amount, category }` | TDS deduction |
| `POST /api/emi` | `{ principal, rate, tenure }` | Loan EMI |
| `POST /api/percentage` | `{ type, a, b }` | Percentage operations |
| `POST /api/age` | `{ dob }` | Age from date of birth |
| `POST /api/height` | `{ value, from }` | Height conversion |
| `POST /api/length` | `{ value, from }` | Length conversion |
| `POST /api/weight` | `{ value, from }` | Weight conversion |
| `POST /api/temperature` | `{ value, from }` | Temperature conversion |
| `POST /api/area` | `{ shape, ...dims }` | Area calculation |

## 🏁 Hosting Guide

### Option 1: Railway (Recommended — Free)
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo → Railway auto-detects Node.js
4. Your app is live at `https://your-app.railway.app`

### Option 2: Render (Free tier)
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Deploy → live in minutes

### Option 3: Heroku
```bash
# Install Heroku CLI, then:
heroku create calcpro-suite
git push heroku main
heroku open
```

### Option 4: DigitalOcean App Platform
1. Push to GitHub
2. DigitalOcean Dashboard → Apps → Create App
3. Select GitHub repo → Node.js detected automatically
4. Deploy

### Option 5: VPS (Ubuntu/Debian)
```bash
# On your server:
sudo apt install nodejs npm nginx -y
git clone <your-repo>
cd calculator-app && npm install

# Install PM2 for process management
npm install -g pm2
pm2 start server.js --name calcpro
pm2 startup && pm2 save

# Configure nginx reverse proxy
sudo nano /etc/nginx/sites-available/calcpro
# Add: proxy_pass http://localhost:3000;
sudo nginx -t && sudo systemctl reload nginx
```

### Option 6: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```
```bash
docker build -t calcpro . && docker run -p 3000:3000 calcpro
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and adjust:

```env
PORT=3000
NODE_ENV=production
```

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework needed)
- **Fonts**: Syne, DM Mono, Outfit (Google Fonts)
- **Style**: Custom dark theme with CSS variables
- **API**: RESTful JSON API
- **Deployment**: Works on any Node.js host

## 📄 License

MIT — free to use, modify, and distribute.
