# Beep Boop Chat

A Next.js-based chat application that allows users to interact with various language models. The application includes user management, chat history, bookmarks, and a credit system.

## Features

- **Multiple Language Models**: Interact with different AI models including:
  - Microsoft Phi-4 Mini Instruct
  - Google Gemma 3.4B Instruct Tuned
  - DeepSeek R1 Distilled Qwen 7B
- **User Management**: Create and switch between different users
- **Credit System**: Each model has a different credit cost per message
- **Chat History**: All conversations are saved and can be resumed
- **Bookmarks**: Save important points in conversations for quick reference
- **Custom Models**: Support for adding your own language models

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [MySQL](https://www.mysql.com/) (v8.0 or newer)
- A local LLM server running on port 1234 (compatible with OpenAI API format)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/beep-boop-chat.git
   cd beep-boop-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Database Setup

1. Copy the environment variables template:

   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your MySQL credentials:

   ```
   MYSQL_HOST=localhost
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=beep_boop_chat
   ```

3. Initialize the database using one of these methods:

   **Option 1**: Using the npm script (recommended):

   ```bash
   npm run db:init
   ```

   **Option 2**: Using the batch file (Windows only):

   ```bash
   init-db.bat
   ```

   **Option 3**: Manual setup:

   ```bash
   # Create the database
   mysql -u your_username -p -e "CREATE DATABASE IF NOT EXISTS beep_boop_chat;"

   # Set up tables
   mysql -u your_username -p beep_boop_chat < src/lib/setup.sql
   ```

4. Verify the database setup:
   ```bash
   npm run db:check
   ```

## Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Create a user and start chatting!

## LLM Server Setup

This application requires a local LLM server that's compatible with the OpenAI API format. You can use tools like:

- [llama.cpp](https://github.com/ggerganov/llama.cpp) with OpenAI API compatibility
- [Ollama](https://github.com/ollama/ollama) with the OpenAI compatibility layer
- [LocalAI](https://github.com/localai/localai)

The server should be running on `http://localhost:1234` with the `/v1/chat/completions` endpoint available.

## Project Structure

```
beep-boop-chat/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/             # API routes
│   │   │   ├── bookmarks/   # Bookmark management
│   │   │   ├── chats/       # Chat management
│   │   │   ├── models/      # Model management
│   │   │   └── users/       # User management
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   ├── lib/                 # Library code
│   │   ├── db.ts            # Database connection
│   │   ├── initDb.ts        # Database initialization
│   │   ├── schema.sql       # Database schema
│   │   └── setup.sql        # Database setup
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── .env.local.example       # Environment variables template
├── DATABASE.md              # Database documentation
├── er-diagram.md            # Entity-Relationship diagram
└── package.json             # Project dependencies and scripts
```

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get a specific user
- `PUT /api/users/[id]/credits` - Update user credits
- `POST /api/users/[id]/add-credits` - Add credits to a user

### Chats

- `GET /api/chats` - Get all chats (filtered by userId)
- `POST /api/chats` - Create a new chat
- `GET /api/chats/[id]` - Get a specific chat
- `PUT /api/chats/[id]` - Update a chat
- `DELETE /api/chats/[id]` - Delete a chat

### Bookmarks

- `GET /api/bookmarks` - Get all bookmarks (filtered by chatId)
- `POST /api/bookmarks` - Create a new bookmark
- `DELETE /api/bookmarks/[id]` - Delete a bookmark

### Models

- `GET /api/models` - Get all models
- `POST /api/models/add` - Add a custom model

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [MySQL](https://www.mysql.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Axios](https://axios-http.com/) - HTTP client

## License

[MIT](LICENSE)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
