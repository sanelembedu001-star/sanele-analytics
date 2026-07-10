# ─── Stage 1: Convert Jupyter Notebook to HTML ───────────────────────────────
FROM python:3.11-slim AS notebook-converter

WORKDIR /notebooks

RUN pip install --no-cache-dir \
    nbconvert==7.16.4 \
    nbformat==5.10.4 \
    jupyter-core==5.7.2 \
    traitlets==5.14.3 \
    Jinja2==3.1.4 \
    pygments==2.18.0 \
    beautifulsoup4==4.12.3 \
    lxml==5.3.0

COPY loan_targeting_analysis.ipynb .

# Convert to self-contained HTML (all assets inlined)
RUN jupyter nbconvert \
    --to html \
    --output-dir /notebooks \
    loan_targeting_analysis.ipynb

# ─── Stage 2: Build React Application ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY frontend/package*.json ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy source code
COPY frontend/ .

# Inject the converted notebook HTML into the public folder
COPY --from=notebook-converter /notebooks/loan_targeting_analysis.html public/notebooks/loan_targeting_analysis.html

# Production build
RUN npm run build

# ─── Stage 3: Production Web Server ──────────────────────────────────────────
FROM nginx:1.27-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
