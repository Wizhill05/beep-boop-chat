# Database Setup Instructions

This project uses MySQL for data persistence. Follow these steps to set up your database:

## Prerequisites

1. Make sure you have MySQL installed and running on your system
2. You should have the MySQL root password (if set)

## Setup Steps

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

3. Initialize the database:
   ```bash
   npm run db:init
   ```

This will:

- Create the database if it doesn't exist
- Create all required tables
- Set up necessary indexes and triggers
- Insert initial LLM models data

## Database Schema

The database consists of the following tables:

### USERS

- Stores user information and credit balance
- Each user has a unique username and email
- Credits are stored as float values

### LLM_MODELS

- Stores available language models
- Includes model name, description, and token cost
- Pre-populated with three models:
  1. phi-4-mini-instruct (0.5 credits per chat)
  2. gemma-3-4b-it (1.0 credits per chat)
  3. deepseek-r1-distill-qwen-7b (1.5 credits per chat)

### CHATS

- Stores chat history for each user
- Includes timestamps and chat data in JSON format
- Links to user through user_id

### CHAT_MODELS

- Tracks which models were used in each chat
- Helps in credit calculation and usage tracking

### BOOKMARKS

- Allows users to bookmark specific points in chats
- Limited to 10 bookmarks per chat (enforced by trigger)
- Stores position data in JSON format

## Features

1. **Credit System**

   - Users start with 0 credits
   - Each model has different credit costs
   - Credits must be added manually through database updates

2. **Chat History**

   - All chats are persisted
   - Can be resumed at any point
   - Full context is maintained

3. **Bookmarks**

   - Maximum 10 bookmarks per chat
   - Stores context for quick reference
   - Can be used as context in future chats

4. **Model Management**
   - Three pre-configured models
   - Support for adding custom models
   - Each model has configurable credit cost

## Troubleshooting

If you encounter any issues during initialization:

1. Make sure MySQL is running
2. Verify your credentials in .env.local
3. Check MySQL user permissions
4. Look for detailed error messages in the console output

For any other issues, check the MySQL error logs or contact the development team.
