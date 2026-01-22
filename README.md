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

## 🔄 The Full CRUD Lifecycle

This project implements the complete **Create, Read, Update, Delete** cycle using modern Next.js patterns.

### 1. Create (`addTicket`)
*   **Location**: `src/app/tickets/actions.ts`
*   **Mechanism**: A Server Action triggered by a `<form>`.
*   **State Management**: Uses `useActionState` to return success/error messages from the server to the client without page reloads.
*   **UX**: Uses `useFormStatus` to show a "Adding..." spinner while the server processes the request.

### 2. Read (`TicketList` & `TicketDetails`)
*   **Location**: `src/app/tickets/page.tsx` & `src/app/tickets/[id]/page.tsx`
*   **Mechanism**: Direct database queries inside **Async Server Components**.
*   **Benefit**: Data is fetched on the server, closer to the database, reducing latency and client-side JavaScript bundles.
*   **Dynamic Routing**: The details page uses `[id]` to fetch specific records based on the URL parameter.

### 3. Update (`updateTicket`)
*   **Location**: `src/app/tickets/actions.ts`
*   **Mechanism**: A Server Action that accepts `(id, prevState, formData)`.
*   **Binding**: We use `.bind(null, id)` in the form component to "bake in" the ticket ID so the form knows which record to update.
*   **Security**: Includes a check to ensure `user_email` matches the ticket owner before applying changes.

### 4. Delete (`deleteTicket`)
*   **Location**: `src/app/tickets/actions.ts`
*   **Mechanism**: A Server Action triggered by a button click (not a form).
*   **UX**: Wrapped in `startTransition` (via `useTransition`) to show a "Deleting..." state while the server redirects the user.
*   **Security**: strictly enforces ownership via database RLS policies.

---

## 🛡 Security & Advanced Patterns

We implemented several "production-grade" features that go beyond a basic tutorial.

### Multi-User Security (RLS)
We moved security from the "Code" to the "Database".
*   **Policy**: "Users can only delete/update rows where `user_email` matches their own."
*   **Effect**: Even if a hacker sends a malicious API request to delete someone else's ticket, the database returns "0 rows affected". The operation is physically impossible at the storage layer.

### Modern React Hooks (React 19)
*   **`useActionState`**: Replaces the need for manual `try/catch` blocks and `useState` for form errors. The server returns an object, and the UI updates automatically.
*   **`useFormStatus`**: Allows a child button component to know if its parent form is submitting, enabling granular loading states without prop drilling.
*   **`useTransition`**: Used for the Delete button to mark a non-navigation update as a transition, keeping the UI responsive.

### Continuous Deployment (CI/CD)
*   The project is configured for **Vercel**.
*   Any push to the `main` branch on GitHub automatically triggers a build and deployment.
*   Environment variables are securely stored in Vercel's project settings, keeping secrets out of the code.

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
| `updateTicket(id, state, formData)` | `src/app/tickets/actions.ts` | **Server Action**. Updates an existing ticket. Must be `.bind()`-ed to an ID in the form component. |
| `deleteTicket(id)` | `src/app/tickets/actions.ts` | **Server Action**. Deletes a ticket by ID. Includes a security check to ensure `user_email` matches the logged-in user. |
| `getTicket(id)` | `src/app/tickets/[id]/page.tsx` | Helper function to fetch a single ticket's details. Triggers `notFound()` if the ID doesn't exist. |

---

## 🎓 Final Mentorship Note

You have successfully transitioned from asking "What is Supabase SSR?" to building a secure, authenticated, data-driven application in a single session.

**Key concepts you have mastered:**

1.  **Server vs. Client Components**:
    *   **Server**: Fetch data, access secrets, render HTML. (Navbar, TicketList)
    *   **Client**: Handle interactivity, onClick, hooks. (DeleteButton, AuthForm)

2.  **Auth Cookies in Middleware**:
    *   Understanding that middleware acts as the "refresher" ensuring the user's session never unexpectedly dies while they are active.

3.  **Server Actions**:
    *   Replacing complex `/api/tickets` routes with simple async functions that run on the server but are called like normal JavaScript functions.

4.  **Row Level Security (RLS)**:
    *   The realization that data protection belongs in the database policy, not just in `if (user.id == ticket.id)` checks in your code.

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
