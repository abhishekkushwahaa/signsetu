# Quiet Hours Scheduler

A full-stack web application that allows users to schedule blocks of focus time and receive automated email reminders 10 minutes before the start time. Built for the SignSetu practical assignment.

**Live Demo:** [https://signsetu.netlify.app/](https://signsetu.netlify.app/)

## Tech Stack

- **Framework:** Next.js (App Router)
- **Backend & Auth:** Supabase (Postgres, Auth, Edge Functions, CRON Jobs)
- **Email Service:** Resend
- **Styling:** Tailwind CSS
- **Runtime:** Bun

---

## Local Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/abhishekkushwahaa/signsetu.git
    cd signsetu
    ```

2.  **Install Dependencies**

    ```bash
    bun install
    ```

3.  **Configure Environment**

    - Copy `.env` to a new file named `.env`.
    - Fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4.  **Run the Development Server**
    ```bash
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.

---

## How to Test the Deployed Application

### 1. Register and Manage Slots

- Navigate to the live demo URL.
- Sign up for a new account and log in.
- On the dashboard, you can create new time slots and delete existing ones.

### 2. Test the Automated Email Reminder

The main feature is the automated email sent 10 minutes before a slot begins.

1.  **Schedule a Slot:** Create a new slot with a start time approximately **15 minutes in the future**.

    > _For example, if it is currently **11:50 PM**, set the slot time for **12:05 AM**._

2.  **Wait for the Trigger:** The reminder is sent when the slot is less than 10 minutes away.

    > _In the example above, after the clock passes **11:55 PM**, the reminder will be processed._

3.  **Check Your Email:** The reminder email will be sent to the pre-configured test address.
