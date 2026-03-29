# Mappd — SoPra FS26 Group 01

Mappd is a web application that lets lecturers structure a course into a so-called skill map, a visual graph of skills and their dependencies. 

This repository contains the Next.js front-end client implementation.

## Tech Stack
* Framework: Next.js (React, TypeScript)
* UI library: Ant Design with a Catppuccin Mocha colour theme
* Graph rendering
* Real-time
* Deployment: Vercel

## Prerequisites
* Node.js >= 18
* npm (ships with Node.js)

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/sopra-fs26-group-01/sopra-fs26-group-01-client.git
cd sopra-fs26-group-01-client

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

## Environment variables

## Project structure

```
app/
├── login/         # Login page
├── register/      # Registration page
├── users/         # User list, profile view, profile edit
├── dashboard/     # Main app dashboard (M3)
├── hooks/         # Custom hooks (useApi, useLocalStorage)
├── api/           # ApiService — centralised HTTP client
├── types/         # Shared TypeScript interfaces and types
├── utils/         # Helpers (domain resolution, auth guards)
└── styles/        # Global CSS (Catppuccin Mocha palette)
```

## Roadmap

## Contributing
This project follows the SoPra FS26 contribution workflow:

1. Every commit must reference a GitHub Issue number (e.g., feat: add registration form #1).
2. Work on feature branches; open a pull request to main for review.
3. Keep contributions.md updated with weekly progress.
4. Run npm run lint before pushing; SonarCloud checks run automatically on push to main.

## Team
 
| Name | GitHub |
|------|--------|
| Chiara Wooldridge | [@chiawld](https://github.com/chiawld) |
| Anna Gubler | [@anna-gubler](https://github.com/anna-gubler) |
| Elias Iskander | [@elsithewizzard](https://github.com/elsithewizzard) |
| Sebastian Huber | [@sebdahub](https://github.com/sebdahub) |
| Hadia Aslam | [@haslam](https://github.com/haslam) |