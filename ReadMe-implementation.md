# Implementation Notes:

## Step 1: Setup

- `npx create-next-app@latest . --typescript --tailwind --eslint`

### During the setup, choose these options when prompted:

- Would you like to use `src/` directory? → Yes (Standard practice for keeping code organized)
- Would you like to use App Router? → Yes (This is the modern Next.js architecture)
- Would you like to customize the default import alias (@/\*)? → No (The default is fine)

### Why?

This gives us a clean slate with the exact tech stack you requested. The "App Router" is crucial as it unlocks React Server Components,
which we'll heavily use for performance.

## Step 2: Dependency

- `npm install @supabase/supabase-js @supabase/ssr react-icons`

### Why?

- `@supabase/supabase-js`: The core JavaScript client to talk to your Supabase database.
- `@supabase/ssr`: A helper library specifically for Next.js that simplifies managing user sessions (cookies) across Server Components,
  Client Components, and Middleware.
- `react-icons`: To replicate the icons (like the delete trash can) from the original project.

## Step 3: Environment Variables Setup

1. Create a file named `.env.local` in the root of your dojo-helpdesk-modern folder.
2. Add the following two variables to it. You will need to get these values from your Supabase Project Settings (under Project Settings >
   API).

- `NEXT_PUBLIC_SUPABASE_URL`=your_supabase_project_url
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`=your_supabase_anon_key

3. (Optional but recommended) Update your README.md to mention that users need to set these variables up to run the project locally.

### Why?

- NEXT*PUBLIC* prefix: This exposes these variables to the browser (client-side), which is necessary because our login forms run in the
  browser.
- .env.local: Keeps secrets out of your codebase history.

## Step 4: Supabase Utilities (Client & Server)

1.  Create a folder named `src/utils/supabase`.
2.  Create `src/utils/supabase/client.ts` for browser-side code

## Step 5: Middleware (Session Refreshing)

- Create a file named `src/middleware.ts` (this must be in your src folder, or the root if you aren't using src).

### Why?

- `supabase.auth.getUser()`: This call checks if the current token is valid. If it's expired but a refresh token exists, it refreshes the session.
- Matching logic: We exclude static assets (images, CSS) to avoid slowing down the site by running auth checks on every single image request.

### The Issues Found:

1. `import { cookies } from "next/headers"`: You cannot use cookies() from next/headers inside Middleware. Middleware runs on the "Edge," and that specific Next.js API isn't supported there. We must use the request and response objects instead (which you are already doing in the functions!).
2. `auth.getSession()` vs `auth.getUser()`: Supabase recommends getUser() for middleware. getSession() is faster because it just checks if the token "looks" valid, but it can be spoofed. getUser() is more secure because it actually validates the user with the Supabase server.
3. `Cookie Options`: When setting cookies on the response, we need to pass the options (like httpOnly, secure, etc.) to make sure the browser stores them correctly.

## Step 6: Global Styles & Configuration

### Why?

We are translating the CSS from the original lesson directly into our modern project. Using @apply inside globals.css allows us to keep the semantic class names (btn-primary, card, pill) which makes the JSX much cleaner.

Without the content array, Tailwind won't generate any CSS because it doesn't know where you are using the classes. Without export default,
Next.js won't be able to read the config at all.

## Step 7-1: The Navbar Component

We'll build the Navbar as a Server Component because it needs to check the user's session to display the "Hello, user@email.com" message and
the Logout button.

1.  Create the folder `src/components`.
2.  Create `src/components/Navbar.tsx`.
3.  We need the logo. You can either use a placeholder or copy the logo from the reference folder. For now, let's use a simple text placeholder or an icon.
4.  Paste the following code into src/components/Navbar.tsx:

### Why?

- Server Component: By making the Navbar async and fetching the user on the server, we avoid that "flash" where the login button shows for a split second before the app realizes you're logged in.
- `@/utils/...`: This uses the import alias we set up, which makes imports cleaner (no more ../../../utils).

## Step 7-2 (Finalizing CSS & Integrating Navbar)

1.  Overwrite `src/app/globals.css` with the v4 syntax I provided (using @import "tailwindcss"; and @theme). This will definitely fix the styling errors.
2.  Update `src/app/layout.tsx`: We need to add our new Navbar so it shows up on every page. We'll also switch the font to Rubik to match the original design.

### Why?

- Root Layout: This is the "shell" of your app. Placing the Navbar here ensures it stays visible as you navigate between pages.
- Rubik: The original lesson used this Google Font to give the app its friendly, clean look.

## Step 8: The Logout Button

As promised, we need a way for users to sign out. This needs to be a Client Component because it handles an onClick event and uses the router to redirect the user.

- Create src/components/LogoutButton.tsx

### Why?

- `"use client"`: Necessary because we are using an interactive event (onClick) and browser-only hooks (useRouter).
- `createClient` (from client.ts): Since this code runs in the browser, we use our client-side Supabase utility.
- `router.refresh()`: This is a powerful Next.js feature. It tells the server to re-render the current route (including the Server Component Navbar) so the "Hello, user" text disappears immediately after logging out.

## Step 9: The Dashboard Page

- Now let's build the main dashboard. This is the page users see at the root /.
- To match the original functionality, we'll check if a user is logged in, and if not, redirect them to the login page (using the new Next.js 16/App Router way).
- Update `src/app/page.tsx`

### Why?

- **Authentication Check**: Even though we have middleware, performing a check inside the Page component is a "layered defense" approach. It also allows us to handle redirects specifically for the home page.
- `redirect()`: This is a specialized Next.js function that throws a "Redirect" error, which the framework catches to perform a server-side
  transition.

## Step 10: The Tickets Page (List View)

- Now we'll move into the Tickets feature. We'll start by creating the page that lists all the tickets from your Supabase database.

1.  Create the folder src/app/tickets.
2.  Create src/app/tickets/page.tsx.
3.  Create a separate component src/app/tickets/TicketList.tsx to handle the data fetching and rendering.

### Why?

- Separation of Concerns: We put the list logic in its own component so we can wrap it in a <Suspense> block later in the main page. This allows the page to load instantly while the "Tickets" part shows a loading state.
- `supabase.from('tickets').select()`: This is the core Supabase query. It fetches all columns from your "tickets" table.

## Step 11: The Tickets Page UI

- Now we need the "shell" for our tickets page.
- This page will display a title, a button to open a new ticket, and then load our TicketList component.
- We'll use <Suspense> to show a loading state while Supabase fetches the data.

1. Update `src/app/tickets/page.tsx`
2. We need a `Loading` component. Next.js has a special file convention for this.

### Why?

- `loading.tsx`: This is a **special file** in Next.js. Any time a page (or a component inside Suspense) is loading, Next.js will automatically show this UI.
- Metadata: We're adding a unique browser tab title for this specific page.

## Step 12: Dynamic Routes (Ticket Details)

- Next, we need the page that shows the full details of a single ticket when you click on it.
- In Next.js, we do this using a **"dynamic route"** segment: `[id]`.

1. Create the folder `src/app/tickets/[id]`.
2. Create `src/app/tickets/[id]/page.tsx`.

### Why?

- `[id]` folder: This tells Next.js that any URL like /tickets/1 or /tickets/abc should be handled by this file. The value (1 or abc) is passed to the component as **params.id**.
- `.eq('id', id).single()`: This filters the Supabase query to find exactly one record where the ID matches the URL.
- `notFound()`: If Supabase doesn't find the ticket, we trigger the **notFound()** function, which shows a custom 404 page.
- `Promise<{ id: string }>`: In Next.js 15/16, params and searchParams are now asynchronous to improve performance during navigation. We must await them.

## Step 13: Custom 404 (Not Found) Page

When we call `notFound()` in the code above, Next.js looks for the nearest not-found.tsx file. To replicate the original project's experience, let's create a custom one.

- Create `src/app/not-found.tsx`

### Why?

A custom 404 page provides a much better User Experience (UX) than a generic browser error. It keeps the user "inside" your app and provides a clear path back to safety (the dashboard).

Bonus: If you want a specific error message just for tickets, you could also create `src/app/tickets/[id]/not-found.tsx` with a message like "We couldn't find that ticket."

## Step 14: The Auth Form Component

- We'll create a reusable AuthForm component that can be used for both **Login** and **Signup**.

1. Create `src/app/(auth)`. The parentheses () denote a `Route Group`.
2. This allows us to organize files without affecting the URL structure. (e.g., src/app/(auth)/login/page.tsx becomes /login).
3. Create `src/app/(auth)/AuthForm.tsx`.

### Why?

- **Route Group** `(auth)`: We can put a layout.tsx inside (auth) later to give the Login and Signup pages a distinct look (like centering them) without affecting the Dashboard layout.
- **Interface**: We defined the handleSubmit prop type so TypeScript knows exactly what arguments the function expects.

## Step 15: The Login Page

- We'll build the `/login` page using our `AuthForm`.
- We'll use the Supabase `signInWithPassword` method.

1. Create `src/app/(auth)/login/page.tsx`.

### Why?

- `createClient()` (from client): Because this is a Client Component ("use client"), we use the browser-side Supabase client.
- `router.refresh()`: This is essential. It forces Next.js to re-fetch the server-side session. Without it, your Navbar might still show "Login" even after you've logged in, because the server hasn't been told to check the new cookies yet.

## Step 16: The Signup Page

- Now let's create the `/signup` page.
- This is similar to the login page, but we'll use `supabase.auth.signUp`.

1. Create `src/app/(auth)/signup/page.tsx`.
2. Create `src/app/(auth)/verify/page.tsx`.

### Why?

- `emailRedirectTo`: When the user clicks the link in their verification email, they will be sent back to your site. This
  URL (/auth/callback) is where we'll handle that "handshake" to log them in.
- Redirect to `/verify`: Instead of logging them in immediately (which won't work if email verification is ON in Supabase),
  we tell them to check their inbox.

## Step 17: The Auth Callback Route

- Now we must build that API route to handle the user returning from their email.

1. Create the folder `src/app/auth/callback`.
2. Create `src/app/auth/callback/route.ts` (Note: route.ts, not page.tsx).

### Why?

- `exchangeCodeForSession(code)`: This is the magic method. It takes the temporary code from the URL and trades it for a permanent Session Cookie.
- `route.ts`: This creates a backend API endpoint, not a visible page.

## Step 18: The "Create Ticket" Form

We have the list view and the details view. Now we need the form to add a new ticket. We will use Next.js Server Actions for this, which is the most modern and recommended way to handle form submissions.

1. Create `src/app/tickets/create/page.tsx`.
2. Create `src/app/tickets/create/CreateForm.tsx`.

### Why?

We are using a POST request to an API route for now (just like the original project) because it's a great way to learn how frontend and backend communicate. In the next step, we'll build that API route to actually save the ticket to Supabase.

## Step 19: Server Action on the Form

We'll use Server Actions here. This is the "React 19" way. It avoids manual fetch calls and state management for basic submissions.

1. Create `src/app/tickets/actions.ts` -- This file defines the server-side code that will run when the form is submitted.

### Why this is the Modern Way?

- `useFormStatus`: This hook automatically detects if the parent <form> is currently executing a Server Action. It's much cleaner than passing isLoading props everywhere!
- Type Safety: FormData is a built-in browser/server type that handles the values.

### You now have:

1. **Authentication**: Signup, Email Verification, Login, Logout.
2. **Protected Routes**: Dashboard and Tickets list are only for logged-in users.
3. **Data Fetching**: Ticket List and Ticket Details using dynamic routing.
4. **Data Mutation**: Ticket Creation using modern Server Actions.

## Step 20: The Delete Ticket Feature

Let's implement the Delete functionality. This completes the CRUD (Create, Read, Update, Delete) cycle—well, at least the CRD part!

1. Update `src/app/tickets/actions.ts`
2. Create `src/app/tickets/[id]/DeleteButton.tsx`
3. Update `src/app/tickets/[id]/page.tsx`

### Why?

The .eq('user_email', user?.email) ensures that even if I know your ticket ID is 55, if I am logged in as
attacker@email.com, the query will find 0 rows to delete because the email won't match.

## Step Bonus: Enhancements

**Improvement 1: Better Architecture**: Let's keep Navbar as server, but extract the links into a client component.

1. Create src/components/NavLinks.tsx
2. Update src/components/Navbar.tsx --- Import NavLinks and replace the hardcoded links.

**Improvement 2: Ticket Card Hover Effect**: Let's make the ticket cards interactive. When you hover over them, they should lift up slightly or change border color.

**Improvement 3: Priority Pill Colors**: The pill colors are a bit muted. Let's make them pop and ensure the text is legible.

**Improvement 4: Enhanced Error Handling with useActionState**

- Right now, if creating a ticket fails (e.g., Supabase is down, or validation fails), the addTicket action just logs to the console and the user sees "Adding..." forever or nothing happens.
- We can improve this using the useActionState hook (new in React 19/Next 15) which allows us to return state (like error messages) from our Server Action back to the Client Component.

1. Update `src/app/tickets/actions.ts`: We need to change the function signature slightly to accept the `prevState`.
2. Update `src/app/tickets/create/CreateForm.tsx`: We will use `useActionState` to hook into the server action.

### Why is this better?

- Feedback Loop: The server can now "talk back" to the specific form instance.
- No `try/catch` in client: The client component stays clean.
- useActionState wraps your server action. It calls addTicket(currentState, formData) for you when the form submits.
- state.message will contain whatever your server action returns (error or success string).

## New Feature: Updating a Ticket:

Let's complete the CRUD cycle with the Update (Edit) feature.

## Step 1: Create the Update Action

- First, we need the server-side logic to handle the update.
- It's very similar to `addTicket`, but it uses `.update()` instead of `.insert()`.

## Step 2: Create the Edit Page

- We need a page that fetches the existing ticket data and displays a form.
- To save time and keep code `DRY (Don't Repeat Yourself)`, we could refactor `CreateForm` to be reusable.
- But for learning clarity, let's create a dedicated `EditForm` first. It's easier to understand.

- 2.a Create `src/app/tickets/edit/[id]/page.tsx`
- 2.b Create `src/app/tickets/edit/[id]/EditForm.tsx`--- This is the Client Component. It receives the ticket as a prop and uses it to fill the initialState of our fields.

### Key Concept: `defaultValue`

In React, defaultValue sets the initial value of an input but leaves it "uncontrolled" so the user can type freely. This is perfect for forms submitted via Server Actions/FormData.

1. bind(null, ticket.id)

The Problem:
Our server action updateTicket is defined like this:
1 function updateTicket(id, prevState, formData)
It needs 3 arguments.

But the <form action={...}> (via useActionState) is hard-coded by React to only send 2 arguments:

1 someAction(prevState, formData)
React doesn't know about our id!

The Solution: `.bind()`
.bind() is a standard JavaScript method. It creates a new copy of a function with some arguments "baked in" (pre-filled).

- Argument 1 (`null`): This sets the this context. In Server Actions, we don't care about this, so we pass null.
- Argument 2 (`ticket.id`): This becomes the first argument of the new function.

So, updateTicketWithId is basically a new function that looks like:

1 function updateTicketWithId(prevState, formData) {
2 // It calls the original function, inserting 'ticket.id' first!
3 return updateTicket("123", prevState, formData);
4 }
Now, the signature matches what React expects (2 args), but our logic gets all 3 args it needs.

---

2. useActionState

This is a React hook designed specifically for form submissions. It acts as a manager between your UI and your Server
Action.

1 const [state, formAction] = useActionState(updateTicketWithId, initialState);

It takes 2 inputs:

1.  The Action: The function to run when the form submits (updateTicketWithId).
2.  Initial State: What state should be before the user does anything (e.g., { message: "" }).

It returns 2 outputs:

1.  `state`: The current data returned by the server action.
    - Initially: { message: "" }
    - After success: { message: "Success" }
    - After error: { message: "Could not update..." }
    - Magic: React automatically updates this variable when the server responds!
2.  `formAction`: A special function handler. You attach this to <form action={formAction}>.
    - When the user clicks submit, React intercepts it.
    - It grabs the state (from the previous run).
    - It grabs the formData (from the inputs).
    - It calls your action: action(prevState, formData).

In simple terms:
useActionState is a helper that says: "I will listen to this form submit. I will run your server code. I will wait for the
answer. And I will update this state variable so you can show success/error messages easily."

## Step 3: Add "Edit" button to the ticket card

1. Update `src/app/tickets/[id]/page.tsx` to include a `Link` to the edit page.
