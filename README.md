# Nomikos UI

A modern, React-based legal filing assistance platform providing intelligent validation and compliance checking for court filings.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for containerized deployment)

### Local Development

```bash
# Install dependencies
npm install

# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

The application will be available at `http://localhost:5173`

---

## Docker Deployment

### Production Deployment

Using Docker Compose (recommended):
```bash
docker-compose up --build
```

The application will be available at `http://localhost:8080`

### Using Docker CLI

Build the image:
```bash
docker build -t nomikos-ui .
```

Run the container:
```bash
docker run -p 8080:80 nomikos-ui
```

### Development with Docker

Run the development container with hot-reload:
```bash
docker-compose --profile dev up nomikos-ui-dev
```

The development server will be available at `http://localhost:5173`

---

## Docker Architecture

### Production Build (`Dockerfile`)
- **Multi-stage build** for optimized image size
- **Node.js 18-alpine** for building the React app
- **Nginx alpine** for serving the production build
- **Health checks** included for container orchestration
- **Security hardening**: non-root user, security headers, gzip compression
- **SPA routing** configured for React Router

### Development Build (`Dockerfile.dev`)
- **Hot-reload support** for development
- **Full development dependencies** included
- Runs on port 5173 (Vite default)

### Configuration

#### Nginx Configuration (`nginx.conf`)
- SPA routing (all routes → index.html for React Router)
- Gzip compression for faster delivery
- Security headers (CSP, X-Frame-Options, etc.)
- Caching strategies:
  - Static assets (JS, CSS, images): 1 year
  - HTML: 1 hour
- Asset versioning for cache busting

#### Docker Compose (`docker-compose.yml`)
- **Production service**: optimized, health-checked, restart policy
- **Development service** (optional profile): with volume mounts for live editing
- Resource limits (commented, enable as needed)
- Environment variables support

---

## Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Supported variables:
- `NODE_ENV`: Set to `production` or `development`
- `VITE_API_URL`: Backend API URL (if applicable)
- `VITE_API_TIMEOUT`: API timeout in milliseconds

---

## Features

- **React 18** with TypeScript
- **Vite** for ultra-fast builds and HMR
- **React Router** for page routing
- **Modular component structure**
- **CSS styling** with organized components
- **Docker-optimized** for production deployment

---

## Project Structure

```
nomikos-ui/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── routes/           # Route definitions
│   ├── data/             # Static data & content
│   ├── styles/           # Component CSS files
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── Dockerfile            # Production build
├── Dockerfile.dev        # Development build
├── docker-compose.yml    # Docker services config
├── nginx.conf            # Nginx configuration
├── .dockerignore         # Files to exclude from Docker build
├── .env.example          # Environment variables template
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

---

## Performance Optimizations

- Multi-stage Docker build reduces final image size
- Nginx gzip compression for transferred data
- Browser caching headers for static assets
- Alpine-based images for minimal footprint
- Layer caching optimization in Dockerfile

---

## Troubleshooting

### Docker not recognized on Windows
- Install Docker Desktop: https://www.docker.com/products/docker-desktop
- Ensure WSL 2 backend is enabled
- Restart your system after installation

### Port already in use
- Change the port mapping in `docker-compose.yml`
- Example: `"9000:80"` (host:container)

### Hot-reload not working in dev container
- Ensure volumes are mounted: `volumes: [".:/app", "/app/node_modules"]`
- Check file permissions on your host

### Build fails
- Clear Docker cache: `docker system prune`
- Rebuild: `docker-compose up --build`

---

## License

[Add your license here]