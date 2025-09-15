# META-AI
META-AI is a full-stack platform integrating multiple AI services into a single interface for unified search and side-by-side result comparison. Built with Java Spring Boot for secure API aggregation and Next.js/React with TailwindCSS for a modern, responsive, and scalable user experience.
META-AI/
├── frontend-nextjs/                # Next.js Frontend
│   ├── .env.local                  # Env variables
│   ├── package.json                # Dependencies
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── public/                     # Static assets
│   └── src/                        # Source code
│       ├── app/                    # Next.js App Router
│       │   ├── layout.tsx          # Root layout
│       │   ├── page.tsx            # Home page
│       │   └── globals.css         # Global styles
│       └── components/             
│           └── AllAiSearch.tsx     # Main search component
│
└── meta-ai-backend/                # Spring Boot Backend
    ├── pom.xml                     # Maven config
    └── src/
        ├── main/java/com/allai/meta_ai_backend/
        │   ├── MetaAiBackendApplication.java  # Main class
        │   ├── controller/          # REST endpoints
        │   ├── service/             # AI provider services
        │   ├── model/               # DTOs & Models
        │   └── config/              # CORS & configs
        └── resources/
            ├── application.properties
            └── application-dev.properties
