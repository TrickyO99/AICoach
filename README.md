# AICoach

A fitness app: enter sex, age, height, weight, activity level, and training days, and get back personalized nutrition and training targets.

**Live (web export):** [aicoach.odtriki.com](https://aicoach.odtriki.com)

## Stack

Expo / React Native (v54) with `expo-router`, TypeScript. Deployable to iOS, Android, and web from a single codebase.

## Local development

```sh
npm install
npx expo start
```

## Deploy

The web build is self-hosted: `Dockerfile` runs `expo export -p web` and serves the static output with `nginx:alpine`, behind a Cloudflare Tunnel. See `../homeserver/docker-compose.yml`.
