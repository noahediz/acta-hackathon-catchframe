# CatchFrame

**Stop guessing what's wrong. Start fixing it.**

CatchFrame is a simple bug reporting tool that records a user's screen, so you can see exactly what went wrong. It's the easiest way to get bug reports that actually help you solve problems faster.

---

## Live Dashboard & Test Site

🚀 [app.catchframe.app](https://app.catchframe.app)  
🐛 [demo.catchframe.app](https://demo.catchframe.app)

---

## The Problem

*"The button doesn't work."*  

We've all gotten bug reports like this. They don't tell you what's really happening, so you waste hours asking questions, guessing the user's browser, and hoping you can see the bug for yourself.  

It's a slow, frustrating process for everyone.

---

## The Solution: A Perfect Bug Report, Every Time

CatchFrame makes bug reporting easy. Just add **one line of code** to your website.  

When a user sees a bug, they click the CatchFrame widget and record their screen. You instantly get a complete report in your team's dashboard.

With CatchFrame, you get:

- A video of what the user did  
- All the console logs and errors  
- A list of any failed network requests  
- Info about their browser and operating system  

You'll understand the problem in **minutes, not days**.

---

## Key Features

- **See What They See:** Get a screen recording with voice narration  
- **Automatic Error Logging:** Captures all console errors and messages automatically  
- **Easy Setup:** Just add a single `<script>` tag to your site  
- **Real-Time Inbox:** New reports show up in your dashboard instantly  
- **Built to Scale:** Uses a modern, serverless architecture on Google Cloud  

---

## How It's Built (Architecture)

CatchFrame is built on a smart, **event-driven system**. It can handle many reports without slowing down. When a report comes in, it's quickly saved and a background job processes the video.

![Architecture Diagram](https://github.com/noahediz/acta-hackathon-catchframe/blob/main/img/architecture.png)

```mermaid
graph TD
    subgraph User's Browser
        A[Buggy Website] -->|1. User records bug| B(CatchFrame Widget);
        B -->|2. Sends report| C[api.catchframe.app];
    end

    subgraph Google Cloud
        C -->|3. Saves video| D[GCS: Raw Uploads Bucket];
        C -->|4. Creates report| E[Firestore (status: processing)];
        C -->|5. Sends job message| F[Pub/Sub Topic];

        F -->|6. Triggers worker| G[Processing Service (Go)];
        G -->|7. Moves video| H[GCS: Processed Bucket];
        G -->|8. Deletes original| D;
        G -->|9. Updates report| E[Firestore (status: completed)];
    end

    subgraph Developer's Dashboard
        I[app.catchframe.app] -->|10. Reads report data| E;
        I -->|11. Plays video| H;
    end

    style A fill:#f8d7da,stroke:#721c24
    style B fill:#d1ecf1,stroke:#0c5460
    style I fill:#d4edda,stroke:#155724
