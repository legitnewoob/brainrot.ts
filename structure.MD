brainrot-renderer/
├── src/                          # All actual source code lives here
│   ├── app.ts                    # Express app setup (no listen)
│   ├── server.ts                 # Entry point – listens on a port
│   │
│   ├── config/                   # Env vars, Remotion bundling
│   │   ├── env.ts
│   │   └── remotion.ts
│   │
│   ├── routes/
│   │   ├── audio.routes.ts
│   │   ├── render.routes.ts
│   │   └── index.routes.ts
│   │
│   ├── controllers/
│   │   ├── audio.controller.ts
│   │   └── render.controller.ts
│   │
│   ├── services/
│   │   ├── audio.service.ts      # Calls ElevenLabs
│   │   └── render.service.ts     # Uses Remotion
│   │
│   ├── middlewares/
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   │
│   ├── queues/
│   │   └── render.queue.ts       # makeRenderQueue logic
│   │
│   ├── utils/
│   │   └── logger.ts
│   │
│   └── types/
│       └── express.d.ts
│
├── public/                       # Static file dir (served in Express)
│   ├── audios/
│   └── renders/
│
├── remotion/                     # Your Remotion compositions
│   └── index.ts
│
├── whisper.cpp/                  # External dependencies (good to isolate)
│   └── ... (unchanged)
│
├── elevenlabs/                   # Keep ElevenLabs SDK wrappers here
│   └── example.mjs               # If reused, wrap cleanly into service
│
├── .env
├── .gitignore
├── .dockerignore
├── Dockerfile
├── remotion.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
└── README.md