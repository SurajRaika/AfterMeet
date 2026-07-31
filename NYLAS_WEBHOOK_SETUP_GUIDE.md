# Nylas Webhook Setup Guide

This guide explains how to connect and configure your Nylas Webhook and explains a critical restriction regarding **ngrok**.

---

## IMPORTANT: Nylas Blocks ngrok!

According to the official Nylas v3 documentation:
> **"Nylas blocks requests to ngrok testing URLs because of throughput limiting concerns. We recommend using Expose, Cloudflare Tunnels (cloudflared), Hookdeck, or VS Code port forwarding instead."**

If you try to use an `ngrok-free.dev` or `ngrok.app` URL, Nylas will block the handshake request from ever reaching your machine, which results in the error:
`"Ensure your server is set up to receive and respond to our challenge."`

To make webhooks work successfully, you **must use an alternative local tunneling tool** such as **Expose** or **Cloudflare Tunnels**. Below is how to set them up.

---

## Alternative 1: Using Expose (Recommended for PHP/Laravel)

**Expose** is an excellent, open-source tunneling tool made specifically for Laravel applications by BeyondCode.

1. **Install Expose globally** via Composer:
   ```bash
   composer global require dev_beyondcode/expose
   ```
2. **Share your local server**:
   Start your local Laravel server:
   ```bash
   php artisan serve
   ```
   Then in another terminal, run:
   ```bash
   expose share http://127.0.0.1:8000
   ```
3. **Get your public URL**:
   Expose will generate a public HTTPS URL like:
   `https://yourcustomdomain.sharedwithexpose.com`
4. Use this URL in the steps below instead of ngrok!

---

## Alternative 2: Using Cloudflare Tunnels (Free & Extremely Stable)

Cloudflare Tunnels are completely free, do not require a paid account, and are never blocked by Nylas.

1. **Install cloudflared**:
   - **macOS**: `brew install cloudflared`
   - **Windows**: Download the binary from Cloudflare or use `winget install Cloudflare.cloudflared`
   - **Linux**: Install via your package manager.
2. **Start your local Laravel server**:
   ```bash
   php artisan serve
   ```
3. **Run the tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```
4. **Get your public URL**:
   Cloudflare will print a URL looking like:
   `https://some-random-words.trycloudflare.com`
5. Use this `.trycloudflare.com` URL in the steps below instead of ngrok!

---

## Step-by-Step Webhook Configuration

Once you have your alternative tunnel URL (e.g., from Expose or Cloudflare):

### Step 1: Add Webhook in Nylas Dashboard

1. **Log in to the Nylas Dashboard**:
   - Go to [dashboard.nylas.com](https://dashboard.nylas.com/) and log in.
2. **Select your v3 Application**:
   - Select your application from the dropdown menu.
3. **Navigate to Webhooks**:
   - In the left sidebar, click on **Webhooks** or **Notifications**.
4. **Create a New Webhook**:
   - Click the **Add Webhook** or **Create Webhook** button.

### Step 2: Configure Webhook Options

1. **Destination URL**:
   - Paste your full tunnel webhook endpoint (replace with your active Cloudflare or Expose URL):
     ```text
     https://<your-tunnel-subdomain>/webhooks/nylas
     ```
2. **Triggers (What to select)**:
   - For email syncing and tracking, check the following:
     - [x] `message.created` *(Fired when a new email is received or sent)*
     - [x] `message.updated` *(Fired when an email status changes, e.g., read/unread or moved)*
3. **Compress webhook payloads (gzip)**:
   - **Keep this checked (Yes!)**. Our application's `NylasWebhookController` has built-in support for automatic gzip decompression. Checking this optimizes payload sizes and helps bypass certain local firewalls.
4. **Save**:
   - Click **Create webhook**.
   - **What happens:** Nylas sends a GET request with a challenge to your URL. Your local application responds with the challenge, and the webhook immediately changes to **Active** (green).

### Step 3: Configure Your Local Environment (`.env`)

1. **Copy the Webhook Secret**:
   - Once created, copy the **Webhook Secret** (signing secret) shown in the Nylas Dashboard.
2. **Update your `.env`**:
   ```env
   APP_URL=https://<your-tunnel-subdomain>
   NYLAS_WEBHOOK_SECRET=your_copied_webhook_secret_here
   ```
