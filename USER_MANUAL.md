# Productive Dashboard — User Manual

**What is this app?**
Productive Dashboard is a personal productivity web app that works on both desktop and mobile (installable as a PWA — Progressive Web App). It combines a focus timer, weekly schedule, task tracking, habit health logs, goals roadmap, notes, leaderboard, and a friends system — all synced to the cloud so your data follows you everywhere.

---

## Table of Contents

| # | Section |
|---|---|
| 0 | [Installing the App on Your Device](#0-installing-the-app-on-your-device) |
| 0b | [Using the App Offline](#using-the-app-offline--sync-behaviour) |
| 1 | [First Launch — Login / Register Screen](#1-first-launch--login--register-screen) |
| 2 | [The Dashboard Layout](#2-the-dashboard-layout) |
| 3 | [Account & Cloud Sync (Connect Tab)](#3-account--cloud-sync-connect-tab) |
| 4 | [Focus Timer](#4-focus-timer) |
| 5 | [Stats (Focus History)](#5-stats-focus-history) |
| 6 | [Tasks](#6-tasks) |
| 7 | [Calendar & Deadlines](#7-calendar--deadlines) |
| 8 | [Timetable](#8-timetable) |
| 9 | [Focus Mode & Panic Mode](#9-focus-mode--panic-mode) |
| 10 | [Friends](#11-friends) |
| 11 | [Leaderboard](#12-leaderboard) |
| 12 | [Plans (Pending Works / Roadmap)](#13-plans-pending-works--roadmap) |
| 13 | [Quick Notes](#14-quick-notes) |
| 14 | [Health Tracker](#15-health-tracker) |
| 15 | [Stopwatch](#16-stopwatch) |
| 16 | [Countdowns](#17-countdowns) |
| 17 | [Wallpapers](#18-wallpapers) |
| 18 | [Widget Settings](#19-widget-settings) |
| 19 | [Sound Settings](#20-sound-settings) |
| 20 | [Data & Backup](#21-data--backup) |
| 21 | [Feedback & Bugs](#22-feedback--bugs) |
| — | [Quick Reference](#quick-reference) |

---

## 0. Installing the App on Your Device

This app is a **PWA (Progressive Web App)** — it installs like a native app directly from your browser. No app store needed.

### On Mobile (Android — Chrome)
1. Open the app URL in **Chrome**.
2. Tap the **three-dot menu (⋮)** at the top-right corner of Chrome.
3. Tap **"Add to Home screen"** or **"Install app"**.
4. A prompt appears — tap **"Install"** or **"Add"**.
5. The app icon appears on your home screen. Tap it to open the app in full-screen, just like a native app — no browser bar visible.

### On Mobile (iOS — Safari)
1. Open the app URL in **Safari** (must be Safari, not Chrome, on iPhone).
2. Tap the **Share button** (box with arrow pointing up) at the bottom of the screen.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right.
5. The icon appears on your home screen.

### On Desktop (Chrome / Edge)
1. Open the app URL in **Chrome** or **Edge**.
2. Look for the **install icon** (computer screen with a down-arrow) in the browser's address bar on the right side.
3. Click it → click **"Install"** in the popup.
4. The app opens in its own window (no browser tabs, no address bar) — feels like a desktop app.
5. It also appears in your Start Menu / taskbar like any other installed app.

> **Tip:** If you don't see the install icon in the address bar, try the three-dot menu (⋮) at the top-right → look for **"Install Productive Dashboard"** or **"Cast, save, and share → Install page as app"**.

---

## Using the App Offline & Sync Behaviour

The app is designed to keep working even when your internet connection drops.

### What works without internet
- The **Focus Timer** runs entirely on-device. It will not stop, pause, or lose time if you go offline.
- **Tasks, Notes, Timetable, Plans, Countdowns** — you can view and edit all of them. Changes are saved locally in your browser instantly.
- **Health logs, Stats** — readable and writable offline.

### What requires internet
- **Logging in / registering** — needs internet for the OTP and authentication.
- **Leaderboard, Friends, Broadcasts** — these pull live data from the server.
- **Cloud Sync (saving to cloud)** — write operations are queued and pushed when internet returns.

### How sync works
Your data is saved to your browser first (instant, always works), and then pushed to the cloud server in the background.

- If you edit something while offline, it is stored locally.
- When internet reconnects, the app automatically detects this and pushes the pending data to the cloud.
- **You will not lose data** by going offline mid-session. The timer, for example, auto-saves focus minutes every 10 minutes and catches up on reconnect.

> **Important:** Data lives in your browser's local storage AND the cloud. If you clear your browser data / use a different browser without logging in, your local copy is gone — but the cloud copy is safe. Logging in on any device restores your data from the cloud.

---

## 1. First Launch — Login / Register Screen

When you open the app for the first time, you will land on the **Login screen**, not the dashboard. You must create an account or log in before anything else is accessible.

### Registering a New Account
1. Click **"Need an account? Register"** on the login screen.
2. Fill in: **Email**, **Username**, **Password**.
3. Submit — a **6-digit OTP** is sent to your email (check spam if not visible).
4. Enter the OTP on the next screen to verify your email.

> **If the app gets stuck on a "Syncing..." or loading screen after registration:**
> This is a known first-load quirk. Simply **close the browser tab / app window completely and reopen it**. Then log in normally with your username and password. Your account is already created — do not register again.

### Logging In
- Enter your **Username or Email** + **Password** → Login.

### Forgot Password
1. Click "Forgot Password?" on the login screen.
2. Enter your registered email → an OTP is sent.
3. Enter the OTP + your new password → done. Then log in.

---

## 2. The Dashboard Layout

After login, you see the main dashboard — a full-screen wallpaper with floating widgets.

- **Bottom Dock** — quick-launch buttons for Timer, Tasks, Notes, Plans, Stats, Calendar, Timetable, etc.
- **Right Toolbar** — Health, Stopwatch, and other secondary widgets.
- **Draggable Widgets** — Clock, Calendar, Timer, Countdowns, Quote. Drag them anywhere.
- **Settings (⚙️)** — accessed via the dock or toolbar, contains all configuration.

---

## 3. Account & Cloud Sync (Connect Tab)

Go to **Settings → Connect & News** after login.

Inside the Connect tab there are four sub-tabs: **Profile**, **Friends**, **News**, **Ranks**.

### Profile Tab
- Displays your username and a green **Sync Active** badge when cloud sync is working.
- **Avatar:** Paste any public image URL (e.g. from imgur) → Save.
- **Alias:** Unlock with your password → set a nickname shown on the leaderboard instead of your real username.
- **Sign Out** and **Delete Account** are both here. Delete requires unlocking first.

> ⚠️ **90-Day Inactivity Warning:** Accounts with no logins for 90 days are **permanently deleted** along with all data. Export your backup regularly via **Settings → Data & Backup**.

---

## 4. Focus Timer

The **Timer widget** sits on the main dashboard and is draggable.

### Starting the Timer

| Method | How |
|---|---|
| Quick preset | Click **5m**, **15m**, or **25m** button |
| Custom minutes | Type a number in the "Custom mins..." box → press **Set** or Enter |
| Click the display | When idle (showing `00:00`), click the big digits to open the editor and set hours:minutes manually |

### Controls while running
- **▶ / ⏸** — Start or Pause
- **⏹** — Stop/Reset — saves any focus minutes already earned, then resets

### What happens if you cancel in the middle?
If you press **⏹ Reset** mid-session, the app does **not lose your time**. Any minutes elapsed are saved to your focus history before the timer clears.

> **Example:** Timer set to 45 min. You stop it at 20 min. Those 20 minutes are saved to today's focus log immediately.

### Auto-save while running (internet loss protection)
The timer saves progress **every 10 minutes automatically** as you work — no internet required for the countdown itself. The saving happens in the background.

- If you lose internet mid-session, the timer **keeps running locally** — it does not stop.
- When internet returns, the next 10-minute checkpoint or the final save (on reset/finish) will sync to the cloud.
- You will **never lose a completed or partially-done session** due to a connection drop.

> **Example:** 45-min session. At 10 min → auto-saves 10 min. At 20 min → saves 10 more. Internet drops at 25 min. Timer keeps going. At 30 min → tries to save, queued. Internet returns. At finish → saves remaining 15 min. Total: 45 min logged correctly.

### Linking Timer to a Task
From the **Tasks** panel, click the **▶** button next to any task. The timer starts and tracks focus time specifically for that task. The task name appears in a blue label above the timer display.

### When the timer finishes
- Alarm plays (if enabled in Settings → Sound).
- A motivational quote popup appears.
- All minutes for the session are recorded to your Stats.

---

## 5. Stats (Focus History)

Open via the **📊 Stats** button on the dock/toolbar.

**Left panel:**
- **Today's Focus** — minutes logged today
- **All Time** — total ever logged
- **7-Day Avg / 30-Day Avg** — daily averages for recent periods
- **Days Logged** — number of days you've used the timer

**Right panel — Monthly Breakdown:**
- Lists all months, sorted newest first.
- Click any month row to expand it → shows individual day entries.
- Each day entry also shows **Academic / Reading / Vocab** minutes if you logged Health data that day.

---

## 6. Tasks

Open from the dock. Add tasks with a title, optional due date, and time estimate.

- Press **▶** on any task to link it to the Focus Timer.
- Check off tasks when done.
- Tasks with deadlines near the alert threshold trigger a banner popup on the dashboard (configure in Settings → Preferences → Deadline Alerts).

---

## 7. Calendar & Deadlines

The **Mini Calendar** is a draggable widget on the dashboard.

### Adding a Deadline to a Date
1. Click any **date** on the calendar grid.
2. The view switches to that day's deadline list.
3. Click **"+ ADD DEADLINE"** at the bottom.
4. Type the deadline name/note directly in the new text field → press **Enter** or click away to save.
5. To edit a saved deadline: **double-click** the text.
6. To delete: click the 🗑️ trash icon next to it.

Dates with deadlines show a **red dot** on the calendar. If a deadline falls on today, the dot pulses.

### View All Deadlines
Click **"VIEW ALL DEADLINES"** at the bottom of the calendar widget to see a sorted list of every deadline across all dates.

### Deadline Alert Notifications
Go to **Settings → Preferences → Deadline Alerts**.

Set the number of days in advance you want an alert popup. Example: set to **3** — if a deadline is in 3 days or less, a warning banner appears automatically on the dashboard each time you open the app.

---

## 8. Timetable

A weekly schedule grid. Open from the dock or toolbar.

### Basic use
- **Weekdays / Weekends** — toggle using the `‹ ›` arrows on either side of the title.
- Today's column is highlighted in purple automatically.
- Click any cell → type the subject or activity (e.g. "Maths", "Gym") → press Tab or click away to save.
- If you type the **exact same text** in back-to-back rows of the same day, those cells visually merge into one block automatically.

### How the time column works
The time column on the left is **fully automatic** — you never type times manually. It works like this:

1. You set a **Day Start Time** (e.g. 8:00 AM).
2. Each row has a **duration** (e.g. 60 min).
3. The app calculates every slot's start and end time by adding durations top-to-bottom from your start time.

> **Example:** Start = 8:00 AM. Row 1 = 60 min → shows `8:00AM – 9:00AM`. Row 2 = 90 min → shows `9:00AM – 10:30AM`. Row 3 = 60 min → shows `10:30AM – 11:30AM`. You only needed to set durations; the times adjust automatically.

**This means:** If you change any row's duration, all rows below it shift their times automatically. The clock column always stays correct.

### Setting the Day Start Time
Click the small **"Day Starts: 9:00 AM"** button just below the title. A time picker appears → choose your time → Save.

- This is saved separately for **Weekdays** and **Weekends**.

> **What if day starts 1 hour early/late?** Just click the Day Starts button and correct the time. All row times recalculate instantly with no manual editing needed.

### Changing a slot's duration
Click any **time cell** in the left column:
- A small editor pops up on that cell.
- Use **▲ +15** / **▼ -15** to adjust in 15-minute steps, or type a number directly (in minutes).
- Press ✓ or Enter to confirm.
- All subsequent row times update automatically.

> **Example:** Row 1 is 60 min. Click it → change to 90 → confirm. Row 1 now shows `8:00AM – 9:30AM` and Row 2 shifts to start at `9:30AM`.

### Adding / Removing rows
Click the **⚙️** settings icon next to the schedule title:

| Option | What it does |
|---|---|
| Add Top Row | Adds a new slot before row 1 and shifts day start back by 1 hr |
| Add Bottom Row | Adds a new slot at the end |
| Delete Top Row | Removes row 1 and moves day start forward |
| Delete Bottom Row | Removes the last row |

---

## 9. Focus Mode & Panic Mode

### Desktop — Keyboard Shortcuts
Configure shortcuts in **Settings → Focus / Panic Mode**.

| Mode | What it does |
|---|---|
| **Focus Mode** | Hides the widgets you selected in the "Focus Specific Setup" section. Press again to restore. |
| **Panic Mode** | Instantly hides ALL widgets. Press again to restore. |

- Click the shortcut input box → press your desired key combo (e.g. `Ctrl + H`) → it saves automatically.
- You can also click **"Trigger"** button to test it manually.
- **Switch Wallpaper on Panic** — toggle ON if you want the wallpaper to also change when Panic is triggered.

### Mobile — Eye Icon Panic
On mobile, there is no keyboard. Instead:

- Look for the **👁️ Eye icon** on the right side of the screen.
- Tap it to trigger the Panic action instantly.

**Panic Action has two modes** (set in Settings → Focus / Panic Mode → Panic Action):

| Mode | What happens |
|---|---|
| **Redirect** | The browser immediately navigates to a random/neutral website, making the dashboard completely invisible to anyone looking. To return: press **Back** in the browser — the dashboard reloads and your session is still active. |
| **Hide UI** | All widgets disappear and the screen goes transparent/blank. Tap the eye icon again to bring everything back. |

> **Summary for mobile:** Tap 👁️ → screen redirects or goes blank. To get back → tap browser Back (redirect mode) or tap the eye area again (hide mode).

---

## 11. Friends

**Settings → Connect & News → Friends tab** (requires login).

### Adding a Friend
1. Use the **search bar** to find users by username.
2. Click **Send Request** next to their name.
3. They will see a pending request badge on their Friends tab.

### Accepting / Rejecting Requests
- A red number badge on the Friends tab shows pending incoming requests.
- Tap the request to **Accept ✓** or **Reject ✗**.

### Viewing Friend Stats
- In your friends list, click the **📊 Stats** icon next to a friend's name.
- A panel opens showing their focus history — today's time, total time, and daily breakdown by month.
- Click **"My Stats"** button to view your own stats in the same view.

### Removing a Friend
Click the 🗑️ trash icon next to any friend → confirm.

---

## 12. Leaderboard

**Settings → Connect & News → Ranks tab** (requires login).

- Shows all users ranked by focus time for **Today / This Week / This Month** — toggle at the top.
- Your own row is highlighted.
- Your **alias** is shown if you set one; otherwise your username is shown.
- Use the search bar to find a specific user.
- Click any user row to expand and see their stats breakdown.

> Set your alias in **Settings → Connect → Profile → Security & Alias** (requires password unlock) to appear anonymously on the leaderboard.

---

## 13. Plans (Pending Works / Roadmap)

Open from the dock. Plan long-term goals broken into actionable steps.

- **Add Plan:** Title + Category + Duration (plain text like "30 days") + Target End Date.
- Each plan card shows a **Days Left / Due Today / Overdue** badge and a completion progress bar.
- Click a plan card → open it → add **Action Items** (sub-topics).
- Click an action item to check/uncheck it. Progress updates instantly.
- Filter plans by category using the dropdown in the top-right.
- To delete a plan: open it → click **"Drop Plan"** at the bottom-left.

---

## 14. Quick Notes

Open from the dock. A simple scratchpad.

- Create multiple notes, each with a title and body text.
- Notes are cloud-synced automatically.
- Export any note as a `.txt` file using the download button.

---

## 15. Health Tracker

Open via the ❤️ icon on the right toolbar.

Log daily metrics:
- **Academic minutes** — formal study time
- **Reading minutes** — books, articles
- **Vocab words** — new English words learned

These feed into the monthly breakdown in Stats, shown alongside focus time.

---

## 16. Stopwatch

Separate from the Focus Timer. Records raw elapsed time.

- Start, Pause, Lap, Reset.
- Each session is saved with its timestamp and visible in Stats history.

---

## 17. Countdowns

A widget showing a list of upcoming events with day countdowns.

- Add an event name + target date.
- Widget shows "X days left" for each.
- Events within your **Deadline Alert Days** threshold show a dashboard popup banner.

---

## 18. Wallpapers

**Settings → Wallpapers**

- Pick from built-in wallpapers (images + animated videos).
- Upload custom wallpapers via URL (separate sets for **Desktop** and **Mobile**, up to 4 each).
- Click a wallpaper thumbnail to make it active.
- **Slideshow mode** — auto-cycles through wallpapers at a set interval (in minutes).
- **Lock a wallpaper** — slideshow will skip it; it stays permanent until unlocked.
- **Hide** a wallpaper from the rotation without deleting it.

---

## 19. Widget Settings

**Settings → Preferences**

- **Widget Visibility** — toggle any widget on or off (Timer, Clock, Calendar, Tasks, Notes, Timetable, Health, Stats, etc.)
- **Widget Drag Locking** — prevent specific widgets from being moved accidentally. Toggle per widget.
- **Reset Default Positions** — resets all draggable widgets back to their original layout positions.
- **Right Toolbar Position** — adjust the vertical height offset of the right toolbar.
- **24-Hour Clock** — toggle between 12h AM/PM and 24h military format.
- **Deadline Alert Days** — how many days before a deadline the alert popup triggers.

---

## 20. Sound Settings

**Settings → Sound Settings**

- **Enable Alarm Sound** — plays audio when timer ends.
- **Enable Device Vibrate** — vibrates phone when timer ends (mobile only).
- **Auto Stop Timer** — slider from 5 seconds to 2 minutes. Controls how long the alarm rings before stopping itself.
- **Select Alarm Sound** — choose from available ringtones.

---

## 21. Data & Backup

**Settings → Data & Backup**

- **Export Data** — downloads a full `.json` backup of all your data. Requires being logged in.
- **Import Data** — upload a `.json` backup file.
  - **Merge:** Combines the backup with your existing data (no data lost from either side).
  - **Overwrite:** Replaces everything with the backup file.
- **Clear Old Data** — delete focus history entries older than a chosen number of days.
- **Clear All Data** — wipes all local data (irreversible).

---

## 22. Feedback & Bugs

**Settings → Feedback & Bugs**

- Submit: **💡 Feature request**, **🐛 Bug report**, or **💬 General feedback**.
- View your submission status:
  - *Reviewing* — received, not yet looked at
  - *Reviewed* — seen by developer
  - *✓ Roadmap!* — accepted and planned

---

## Quick Reference

| What you want to do | Where |
|---|---|
| Start focus timer | Timer widget on dashboard |
| See your focus logs | 📊 Stats button on dock |
| Set weekly schedule | Timetable (dock) |
| Add a deadline to a date | Click the date on the Calendar widget |
| Set deadline alert threshold | Settings → Preferences → Deadline Alerts |
| Plan long-term goals | Plans / Roadmap (dock) |
| Check the leaderboard | Settings → Connect → Ranks tab |
| Add / accept friends | Settings → Connect → Friends tab |
| View a friend's stats | Friends tab → 📊 icon next to their name |
| Backup your data | Settings → Data & Backup → Export |
| Change wallpaper | Settings → Wallpapers |
| Hide/show widgets | Settings → Preferences → Widget Visibility |
| Lock widgets in place | Settings → Preferences → Widget Drag Locking |
| Panic button (mobile) | Tap 👁️ Eye icon on right side of screen |
| Panic / Focus shortcut (desktop) | Settings → Focus / Panic Mode |
| Set alias for leaderboard | Settings → Connect → Profile → Security & Alias |
| Reset password | Login screen → "Forgot Password?" |
