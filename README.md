# BookLeaf Publishing

A publishing platform for authors to manage books and support tickets, with an admin portal for handling queries and AI-assisted ticket management.

## Project Structure

```text
bookleaf-publishing/
├── backend/   # FastAPI backend
└── web/       # Next.js frontend
```

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL
- **AI:** OpenAI API

## Features

### Web (`web/`)
- Authentication and login
- **Author portal:** Create tickets, view ticket history, browse published books, and view book details.
- **Admin portal:** View tickets and reply to author queries.

### Backend (`backend/`)
- REST APIs built with FastAPI
- PostgreSQL database integration
- AI-assisted ticket replies using OpenAI
- Automatic ticket tagging and priority assignment

## Getting Started

Run the frontend and backend separately. See each folder for its dependencies and configuration.

Configure the required environment variables, including database credentials and the OpenAI API key, before starting the application.

---

**BookLeaf Publishing** — Simplifying author support and publishing workflows.
