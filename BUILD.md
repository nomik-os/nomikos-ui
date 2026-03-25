# Build Instructions

## Option 1: Build Image Locally (Recommended)

Build the image explicitly first, then reference it in docker-compose:

```powershell
# Step 1: Build the image with a specific tag
docker build -t nomikos-ui:latest .

# Step 2: Run with docker-compose
docker-compose up
```

The image will be cached locally after the first build, so subsequent runs won't need to pull from Docker Hub.

---

## Option 2: Direct Docker Run (Without Compose)

```powershell
# Build the image
docker build -t nomikos-ui:latest .

# Run the container
docker run -p 8080:80 nomikos-ui:latest
```

Then visit: `http://localhost:8080`

---

## Option 3: If Docker Hub is Down

If Docker Hub is experiencing issues, try pulling base images manually first:

```powershell
# Pull node image (for build stage)
docker pull node:18-alpine

# Pull nginx image (for runtime)
docker pull nginx:alpine

# Then build your image
docker build -t nomikos-ui:latest .

# Run with compose
docker-compose up
```

---

## Troubleshooting

### Error: "failed to resolve source metadata"
- This is a Docker Hub connectivity issue
- Try again in a few minutes
- Or use the manual pull approach above

### Image Already Built
If the image is already built, just run:
```powershell
docker-compose up
```

No rebuild needed (use `--no-cache` to force rebuild):
```powershell
docker-compose up --build --no-cache
```

---

## Check Built Images

```powershell
docker images
```

Look for `nomikos-ui` in the list to see available tags.
