# Nylas Webhook Setup Guide

This guide explains how to connect and configure your Nylas Webhook using your **ngrok** tunnel URL: `https://lumber-mossy-decency.ngrok-free.dev`.

Follow these step-by-step instructions to configure, verify, and activate the webhook in your Nylas Dashboard and local Laravel application.

---

## Prerequisites

Before starting, make sure your local development environment is running and accessible:

1. **Start your local Laravel server**:
   ```bash
   php artisan serve
   ```
   *(This starts the application locally, typically at `http://127.0.0.1:8000`)*

2. **Ensure your ngrok tunnel is running and pointing to port `8000`**:
   ```bash
   ngrok http 8000
   ```
   *(Ensure that the generated ngrok URL is exactly: `https://lumber-mossy-decency.ngrok-free.dev`)*

3. **Verify the endpoint is reachable**:
   - Open your browser and navigate to: `https://lumber-mossy-decency.ngrok-free.dev/webhooks/nylas`
   - You should see a blank screen or a `404` or `Method Not Allowed` if accessed via GET without parameters, but it should not return a connection/tunnel error. If you append `?challenge=test_handshake`, e.g., `https://lumber-mossy-decency.ngrok-free.dev/webhooks/nylas?challenge=test_handshake`, it should return `test_handshake` as plain text. This means your handshake endpoint is fully working and ready!

---

## Step 1: Add Webhook in Nylas Dashboard

1. **Log in to the Nylas Dashboard**:
   - Go to [dashboard.nylas.com](https://dashboard.nylas.com/) and log in.

2. **Select your v3 Application**:
   - Select the application you are configuring from the applications dropdown list.

3. **Navigate to Webhooks**:
   - In the left-hand navigation sidebar, click on **Webhooks** (under the Integration or Developer section).

4. **Create a New Webhook**:
   - Click the **Add Webhook** or **Create Webhook** button.

---

## Step 2: Configure Webhook Options

In the creation form, fill out the following details exactly as shown:

1. **Destination URL**:
   - Paste your full ngrok webhook endpoint:
     ```text
     https://lumber-mossy-decency.ngrok-free.dev/webhooks/nylas
     ```

2. **Webhook Trigger Events (Select the following based on your needs)**:
   - For email syncing and tracking:
     - [x] `message.created` *(Triggers when a new email is received or sent)*
     - [x] `message.updated` *(Triggers when an email status changes, e.g. read, unread, or moved)*
   - *(Optional) For calendars and contacts if you plan to integrate them:*
     - [ ] `event.created` / `event.updated`
     - [ ] `contact.created` / `contact.updated`

3. **Save and Complete Handshake**:
   - Click **Save** or **Create**.
   - **What happens next:** Nylas will immediately send a `GET` request containing a `challenge` parameter to your ngrok URL.
   - Your local application's `NylasWebhookController` will automatically detect this `GET` request and return the challenge string back in plain text with a `200 OK` status.
   - Once Nylas receives this response, it will mark your webhook status as **Active** (green checkmark).

---

## Step 3: Configure Your Local Environment (`.env`)

Once the webhook is active:

1. **Copy the Webhook Secret**:
   - The Nylas Dashboard will display your new **Webhook Secret** (sometimes labeled as *Signing Secret*). Copy this secret key.

2. **Update your `.env` file**:
   - Open your project's `.env` file and locate or add the `NYLAS_WEBHOOK_SECRET` key.
   - Paste the secret:
     ```env
     NYLAS_WEBHOOK_SECRET=your_copied_webhook_secret_here
     ```

3. **Update your App URL**:
   - Ensure your `APP_URL` in `.env` is also set to your tunnel URL:
     ```env
     APP_URL=https://lumber-mossy-decency.ngrok-free.dev
     ```

---

## Troubleshooting Handshake Failures

If Nylas fails to verify your endpoint during step 2, check the following:

1. **Is your Laravel server running?**
   - Ensure `php artisan serve` is running in your terminal.
2. **Is ngrok connected to the correct port?**
   - Make sure ngrok is forwarding to `http://localhost:8000` (or whichever port your Laravel app is using).
3. **Is the route excluded from CSRF verification?**
   - Yes, in our Wave application, the webhook route is defined in `routes/web.php` and is completely open to receive external requests, so CSRF won't block it.
4. **Is ngrok's custom domain configured properly?**
   - Ensure you are using the correct ngrok free domain `https://lumber-mossy-decency.ngrok-free.dev` in your ngrok CLI command.
