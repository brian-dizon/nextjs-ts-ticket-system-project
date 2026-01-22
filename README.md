# Dojo Helpdesk (Modern Edition)

A full-stack, production-ready ticketing system built with **Next.js 16**, **Supabase SSR**, and **Tailwind CSS v4**.

This project serves as a comprehensive example of modern React architecture, featuring **Server Actions**, **App Router**, **Middleware Authentication**, and **Row Level Security (RLS)**.

---

## 🏗 System Flow

Understanding how data moves through this application is key to mastering Next.js. Here is the step-by-step lifecycle of a typical user interaction:

### 1. The Request (Entry Point)
*   A user visits `http://localhost:3000/tickets`.
*   **Middleware (`src/middleware.ts`)** intercepts the request *before* it reaches the page.
    *   It calls Supabase to check if the user has a valid session cookie.
    *   If the session is expired but has a refresh token, it silently refreshes the session and sets a new cookie.
    *   It passes the request forward to the Next.js App Router.

### 2. The Page Load (Server Component)
*   The request reaches `src/app/tickets/page.tsx`.
*   This is a **Server Component**, meaning it runs entirely on the backend (Node.js).
*   It invokes `TicketList` component, which calls `createClient()` from `src/utils/supabase/server.ts`.
*   The server fetches data directly from the Supabase database.
*   The HTML is generated with the data baked in and sent to the browser.

### 3. The Interaction (Client Component)
*   The user clicks "Add Ticket" (`src/app/tickets/create/page.tsx`).
*   The form uses a **Client Component** (`CreateForm.tsx`) to handle user input.
*   When the user submits, it triggers a **Server Action** (`addTicket` in `actions.ts`).

### 4. The Mutation (Server Action)
*   The Server Action receives the `FormData`.
*   It validates the user's session again (security layer).
*   It inserts the new ticket into Supabase.
*   It calls `revalidatePath('/tickets')`, forcing Next.js to purge the cached HTML for the tickets page.
*   It redirects the user back to `/tickets`, where they see their new data immediately.

---

## 📚 Detailed Function Reference

A guide to the core functions that power this application.

### Authentication & Supabase
| Function | File | Purpose |
| :--- | :--- | :--- |
| `createClient()` (Server) | `src/utils/supabase/server.ts` | Initializes Supabase for Server Components/Actions. Uses `cookies()` to securely read auth tokens from the incoming request. |
| `createClient()` (Client) | `src/utils/supabase/client.ts` | Initializes Supabase for Client Components (Browser). access `localStorage` and browser cookies directly. |
| `middleware(request)` | `src/middleware.ts` | Runs on every route. Responsible for keeping the user's session alive by refreshing tokens automatically. |

### Ticket Management
| Function | File | Purpose |
| :--- | :--- | :--- |
| `addTicket(prevState, formData)` | `src/app/tickets/actions.ts` | **Server Action**. Receives form data, inserts a new ticket into the DB, and revalidates the cache. Returns a state object (success/error message). |
| `deleteTicket(id)` | `src/app/tickets/actions.ts` | **Server Action**. Deletes a ticket by ID. Includes a security check to ensure `user_email` matches the logged-in user. |
| `getTicket(id)` | `src/app/tickets/[id]/page.tsx` | Helper function to fetch a single ticket's details. Triggers `notFound()` if the ID doesn't exist. |

---

## 🧠 Concepts to Know

If you are new to Next.js or React 19, these concepts are essential for understanding this codebase.

### 1. Server Actions (`"use server"`)
Traditionally, you needed to create an API route (`/api/submit`) and `fetch()` it from the frontend.
**In this project:** We define a function in `actions.ts` with `"use server"` at the top. We can pass this function *directly* to the `<form action={...}>` prop. React handles the network request, serialization, and security for us.

### 2. Middleware
Think of Middleware as a **security guard** standing at the door of your server. Every time a browser asks for a page, the middleware checks their ID badge (Cookie) first. If the badge is expired, it stamps it with a new date (Refreshes Token) before letting them in.

### 3. Route Groups (`(auth)`)
You will see a folder named `(auth)`. The parentheses tell Next.js to **ignore** this folder for the URL structure.
*   `src/app/(auth)/login/page.tsx` -> `website.com/login`
*   **Why?** It lets us group Login and Signup pages together (e.g., to share a layout) without making the URL `website.com/auth/login`.

### 4. Supabase RLS (Row Level Security)
We don't filter data in our Javascript query (e.g., `where user_id = x`). We rely on the Database Policy.
*   **Policy:** "Users can only delete rows where `user_email` matches their own email."
*   **Effect:** Even if a hacker calls `deleteTicket(999)`, the database returns "0 rows deleted" because the policy silently hides rows they don't own.

### 5. `useActionState` Hook
This React 19 hook allows a form to "talk" to a Server Action.
*   It accepts the action function (`addTicket`) and an initial state.
*   It returns the current state (success/error messages) and a new action function to attach to the form.
*   This creates a smooth feedback loop without complex `try/catch` blocks in your UI components.

---

## 🚀 Getting Started

1.  **Clone & Install**
    ```bash
    git clone https://github.com/your-username/dojo-helpdesk-modern.git
    cd dojo-helpdesk-modern
    npm install
    ```

2.  **Environment Variables**
    Create a `.env.local` file in the root:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Run Locally**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`

---

## 🛠 Tech Stack

*   **Framework**: Next.js 16.1.4 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4
*   **Database**: Supabase (PostgreSQL)
*   **Auth**: Supabase SSR (PKCE Flow)
*   **Icons**: React Icons (Ti)