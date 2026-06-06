# AI-Powered Customer Success Platform

A full-stack Customer Success Platform that enables users to manage customers, track meetings and interactions, generate AI-powered insights from meeting notes, and view operational metrics through a dashboard.

## Technology Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Redux Toolkit
- Axios
- Formik + Yup (form validation)
- Recharts (dashboard charts)
- Tailwind CSS

### Backend
- Python
- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL
- Redis
- JWT Authentication (httpOnly cookies)

### Deployment
- Docker
- Docker Compose
- PostgreSQL and Redis containerized

## Getting Started

### Prerequisites
- Python 3.13+
- Node.js 20+
- PostgreSQL
- Redis

### Setup

1. Clone the repository:
```bash
git clone git@github.com:npcoder2403/AI-powered-Customer-Success-Platform.git
cd AI-powered-Customer-Success-Platform
```

2. Configure environment variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Update `backend/.env` with your database credentials and Groq API key:
```
DATABASE_URL=postgresql://your_user@localhost:5432/customer_success
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
AI_API_KEY=your-groq-api-key
AI_API_URL=https://api.groq.com/openai/v1/chat/completions
AI_MODEL=llama-3.3-70b-versatile
CACHE_TTL=300
```

4. Create the PostgreSQL database:
```bash
createdb customer_success
```

5. Start both services:
```bash
chmod +x run.sh
./run.sh
```

### Using Docker Compose

```bash
docker compose up --build
```

### Access Points

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000       |
| Backend   | http://localhost:8000       |
| API Docs  | http://localhost:8000/docs  |

New users registered via the UI are assigned the `admin` role by default. Admins can manage user roles from the User Management page.

## Core Modules

### 1. Authentication & Authorization
- User registration and login with JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt
- Role-based access control (Admin / User)
- Secure session handling via httpOnly, SameSite, and cookie expiration
- Protected routes on both frontend and backend
- Profile endpoint for fetching current user details
- Logout endpoint that clears the auth cookie

### 2. Customer Management
- Full CRUD operations (Create, Read, Update, Delete)
- Customer list with filters: search by company name, industry, status
- Pagination support
- Admin-only access for create, update, and delete operations
- All authenticated users can view customer list and details

### 3. Meeting / Interaction Management
- Create and update interactions linked to customers
- Interaction list with filters: customer, interaction type, date range
- Pagination support
- User ownership tracking via `created_by` field
- Regular users see only their own interactions; admins see all
- Interaction types: Meeting, Call, Email, Demo, Support

### 4. AI-Powered Insights
- Automatically generates structured insights when meeting notes are submitted
- AI output includes:
  - Summary of the meeting
  - Sentiment analysis (Positive / Neutral / Negative)
  - Action items and follow-up points
  - Key risks and blockers
- Uses Groq API (Llama 3.3 70B) with OpenAI-compatible endpoint
- Prompt handling with structured JSON output parsing
- Retry logic (up to 3 attempts) on API failure
- Fallback response when AI generation fails
- Insights stored in the `ai_insights` table linked to interactions
- Insights regenerated when meeting notes are updated

### 5. Dashboard
- Stat cards: Total Customers, Total Interactions, Positive/Neutral/Negative sentiments
- Customer Growth chart (area chart with monthly data)
- Interactions Per Month chart (bar chart)
- Sentiment Distribution (donut chart with legend and progress bars)
- Empty state handling when no data exists
- All data loaded from backend API

### 6. Redis Caching
- Customer list API responses cached in Redis
- Cache key includes page, page_size, search, industry, and status parameters
- TTL: 300 seconds (configurable via `CACHE_TTL`)
- Cache invalidation on customer create, update, or delete
- No stale data served after any mutation
- Graceful fallback when Redis is unavailable

### 7. User Management (Admin Only)
- View all registered users
- Promote users to admin or demote to regular user
- Confirmation dialog before role changes
- Accessible only to admin users

## API Endpoints

### Authentication
| Method | Endpoint             | Description        | Access  |
|--------|----------------------|--------------------|---------|
| POST   | /api/auth/register   | Register new user  | Public  |
| POST   | /api/auth/login      | Login              | Public  |
| POST   | /api/auth/logout     | Logout             | Public  |
| GET    | /api/auth/profile    | Get current user   | Auth    |

### Customers
| Method | Endpoint              | Description          | Access  |
|--------|-----------------------|----------------------|---------|
| GET    | /api/customers        | List with filters    | Auth    |
| GET    | /api/customers/{id}   | Get details          | Auth    |
| POST   | /api/customers        | Create               | Admin   |
| PUT    | /api/customers/{id}   | Update               | Admin   |
| DELETE | /api/customers/{id}   | Delete               | Admin   |

### Interactions
| Method | Endpoint                 | Description         | Access  |
|--------|--------------------------|---------------------|---------|
| GET    | /api/interactions        | List with filters   | Auth    |
| GET    | /api/interactions/{id}   | Get details         | Auth    |
| POST   | /api/interactions        | Create              | Auth    |
| PUT    | /api/interactions/{id}   | Update              | Auth    |

### Dashboard
| Method | Endpoint               | Description      | Access  |
|--------|------------------------|------------------|---------|
| GET    | /api/dashboard/metrics | Get all metrics  | Auth    |

### Users (Admin Only)
| Method | Endpoint                  | Description      | Access  |
|--------|---------------------------|------------------|---------|
| GET    | /api/users                | List all users   | Admin   |
| PATCH  | /api/users/{id}/role      | Update user role | Admin   |

## Database Schema

### users
| Column          | Type         | Constraints              |
|-----------------|--------------|--------------------------|
| id              | Integer      | Primary Key, Auto        |
| email           | String(255)  | Unique, Not Null, Index  |
| full_name       | String(255)  | Not Null                 |
| hashed_password | String(255)  | Not Null                 |
| role            | Enum         | admin / user             |
| created_at      | DateTime     | Auto                     |
| updated_at      | DateTime     | Auto                     |

### customers
| Column       | Type         | Constraints              |
|--------------|--------------|--------------------------|
| id           | Integer      | Primary Key, Auto        |
| company_name | String(255)  | Not Null, Index          |
| contact_name | String(255)  | Not Null                 |
| email        | String(255)  | Not Null                 |
| phone        | String(50)   | Nullable                 |
| industry     | String(100)  | Index                    |
| status       | Enum         | active/inactive/lead/churned, Index |
| created_at   | DateTime     | Auto                     |
| updated_at   | DateTime     | Auto                     |

### interactions
| Column           | Type         | Constraints              |
|------------------|--------------|--------------------------|
| id               | Integer      | Primary Key, Auto        |
| customer_id      | Integer      | Foreign Key (customers), Index |
| created_by       | Integer      | Foreign Key (users), Index |
| title            | String(255)  | Not Null                 |
| interaction_type | Enum         | meeting/call/email/demo/support, Index |
| meeting_notes    | Text         | Nullable                 |
| meeting_date     | DateTime     | Not Null                 |
| created_at       | DateTime     | Auto                     |

### ai_insights
| Column         | Type         | Constraints              |
|----------------|--------------|--------------------------|
| id             | Integer      | Primary Key, Auto        |
| interaction_id | Integer      | Foreign Key (interactions), Unique |
| summary        | Text         | Not Null                 |
| sentiment      | String(20)   | Not Null                 |
| action_items   | Array(String)| Default []               |
| risks          | Array(String)| Default []               |
| created_at     | DateTime     | Auto                     |

## Validation

### Frontend (Formik + Yup)
- Login: email format, required fields
- Register: email format, password min 6 chars, password confirmation match
- Customer: company name min 2 chars, valid email, required fields
- Interaction: title min 3 chars, required customer/date/type

### Backend (Pydantic)
- Email validation via `EmailStr`
- Required field enforcement
- Enum validation for status, role, interaction_type
- Query parameter validation with min/max bounds

## Project Structure

```
.
├── docker-compose.yml
├── run.sh
├── README.md
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py
│   ├── alembic.ini
│   ├── alembic/
│   └── app/
│       ├── api/               # Route handlers
│       │   ├── auth.py
│       │   ├── customers.py
│       │   ├── interactions.py
│       │   ├── dashboard.py
│       │   └── users.py
│       ├── auth/              # JWT (httpOnly cookie) & password hashing
│       ├── cache/             # Redis caching with TTL & invalidation
│       ├── database/          # SQLAlchemy engine, session, config
│       ├── models/            # ORM models (User, Customer, Interaction, AIInsight)
│       ├── schemas/           # Pydantic request/response validation
│       ├── services/          # Business logic & AI integration
│       └── utils/
└── frontend/
    ├── Dockerfile
    ├── .env.example
    ├── app/                   # Next.js App Router
    │   ├── auth/              # Login, Register pages
    │   └── (app)/             # Protected layout with sidebar
    │       ├── dashboard/
    │       ├── customers/     # List, Create, Detail, Edit
    │       ├── interactions/  # List, Create, Detail, Edit
    │       ├── users/         # User Management (Admin)
    │       └── profile/
    └── src/
        ├── components/
        │   ├── ui/            # Input, Select, Button, Card, Badge, Dialog,
        │   │                  # Table, DateTimePicker, FormField, PageHeader, etc.
        │   └── shared/        # LoadingSpinner, EmptyState, Providers
        ├── hooks/             # useAuth, useDebounce
        ├── services/          # Axios API service layer
        ├── store/             # Redux Toolkit slices (auth, customer, interaction, dashboard)
        ├── types/             # TypeScript interfaces
        └── utils/             # Yup schemas, error message helper
```

## Implementation Notes

- **Authentication**: JWT tokens stored in httpOnly cookies (not localStorage) for XSS protection. Cookies set with SameSite=Lax and configurable expiration. Backend reads token from cookies, not Authorization header.
- **RBAC**: Admin can manage all resources. Regular users can only manage their own interactions. Customer CRUD restricted to admins. Role enforcement on both backend (FastAPI dependencies) and frontend (conditional UI rendering).
- **AI Integration**: Uses Groq's free API with Llama 3.3 70B model. OpenAI-compatible endpoint format. Structured prompt returns JSON with summary, sentiment, action items, and risks. Retry with fallback on failure.
- **Caching**: Redis caches customer list responses keyed by query parameters. TTL of 300 seconds. All customer mutations invalidate the cache. Application works gracefully when Redis is down.
- **Frontend**: Custom reusable UI component library (Input, Select, Button, Card, Badge, Dialog, DateTimePicker, Table, FormField). Formik + Yup for form state and validation. Debounced search inputs. Redux Toolkit for global state. Responsive sidebar layout.
- **Docker**: Both frontend and backend have Dockerfiles. docker-compose.yml orchestrates all 4 services (frontend, backend, postgres, redis). Volume mounts for development. Health checks on database and cache services.
