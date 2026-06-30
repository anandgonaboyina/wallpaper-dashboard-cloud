# Productive Dashboard — User Manual

## 0. Introduction

**What is this app?**
Productive Dashboard is a personal productivity web app that works on both desktop and mobile (installable as a PWA — Progressive Web App). It combines a focus timer, stopwatch, weekly timetable, task manager, roadmap planner, rich-text notes, health tracker, leaderboard, friends system, calendar with deadlines, countdown widgets, wallpaper system, and live quotes — all synced to the cloud so your data follows you everywhere.

### Core Features
- **Unified Workspace**: Eliminate distractions with a clean, centralized hub.
- **Smart Timetable**: Take absolute control of your schedule with a precision interactive timetable.
- **Task Management**: Never miss a deadline with intuitive drag-and-drop to-do lists.
- **Global Leaderboard**: Turn productivity into a game and climb the global ranks.
- **Focus Widgets**: Customize your space with sticky notes, weather updates, and goals.
- **Cloud Sync**: Your data follows you seamlessly across all your devices in real-time.

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
- **Tasks, Notes, Timetable, Roadmap, Countdowns** — you can view and edit all of them. Changes are saved locally in your browser instantly.
- **Health logs, Stats** — readable and writable offline.

### What requires internet
- **Logging in / registering** — needs internet for the OTP and authentication.
- **Leaderboard, Friends, Broadcasts** — these pull live data from the server.
- **Cloud Sync (saving to cloud)** — write operations are queued and pushed when internet returns.

### How sync works
Your data is saved to your browser first (instant, always works), and then pushed to the cloud server in the background.

- If you edit something while offline, it is stored locally.
- When internet reconnects, the app automatically detects this and pushes the pending data to the cloud.
- **You will not lose data** by going offline mid-session.

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

- **Bottom Dock** — quick-launch buttons for Timer, Tasks, Notes, Roadmap, Stats, Calendar, Timetable, etc.
- **Right Toolbar** — Health, Stopwatch, Settings and other secondary toggle icons.
- **Draggable Widgets** — Clock, Calendar, Timer, Countdowns. Drag them anywhere on the screen.
- **Settings (⚙️)** — accessed via the dock or toolbar; contains all configuration panels.

The loading screen that appears on startup shows your profile picture and intro text while data is syncing. If syncing takes longer than expected, it automatically switches to **Motivator Mode** — showing a random motivational quote and a feature carousel to keep you engaged while the data loads.

---

## 3. Account & Cloud Sync (Connect Tab)

Go to **Settings → Connect & News** after login.

Inside the Connect tab there are four sub-tabs: **Profile**, **Friends**, **News**, **Ranks**.

### Profile Tab
- Displays your username and a green **Sync Active** badge when cloud sync is working.
- **Avatar:** Paste any public image URL (e.g. from imgur) → Save. The image updates everywhere including the loading screen.
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
- When internet returns, the next 10-minute checkpoint or the final save will sync to the cloud.
- You will **never lose a completed or partially-done session** due to a connection drop.

### Linking Timer to a Task
From the **Tasks** panel, click the **▶** button next to any task. The timer starts and tracks focus time specifically for that task. The task name appears in a label above the timer display.

### When the timer finishes
- Alarm plays (if enabled in Settings → Sound).
- A motivational quote popup appears.
- All minutes for the session are recorded to your Stats.

### Advanced: Background Alarm via MacroDroid (Android)
Because mobile operating systems suspend background web apps, the browser may not be able to continuously play a looping alarm sound if you close the app or lock the screen. 
To guarantee a full alarm rings even while the app is closed, you can use an automation app like **MacroDroid** to intercept the app's push notification.

**How to set it up in MacroDroid:**
1. Create a new Macro.
2. **Trigger:** Select `Notification Present`. Choose `Any Application` (or your browser/PWA) and set the **Text Content** to strictly match one of the following exact titles:
   - `PWA_ALARM_RING_VIBRATE` (Triggered when both sound and vibration are enabled in your app settings)
   - `PWA_ALARM_RING` (Triggered when only sound is enabled)
   - `PWA_ALARM_VIBRATE` (Triggered when only vibration is enabled)
   - `PWA_ALARM_TRIGGER` (Fallback title)
3. **Action:** Set it to `Play/Stop Sound` and choose your preferred alarm tone, or `Vibrate` depending on the notification title.
4. **Constraint (Optional):** Only run if the screen is off.
5. Create a second macro to **Stop** the sound when you interact with the phone (e.g., **Trigger:** `Device Shake` or `Volume Button Pressed` → **Action:** `Play/Stop Sound` -> Stop).

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

You can also click any **friend's 📊 Stats icon** in the Friends tab to view their breakdown in the same panel.

---

## 6. Tasks

Open from the dock. A focused task list to plan your work session.

- **Add a task:** Click the **+** button. Fill in title, optional due date, and time estimate.
- **Start timer for a task:** Press **▶** next to any task — the Focus Timer starts and shows that task's name as context.
- **Check off tasks:** Tap/click the checkbox on the left to mark as done.
- **Delete a task:** Click the trash icon next to it.

Tasks with deadlines near the alert threshold trigger a **banner popup on the dashboard** (configure in Settings → Preferences → Deadline Alerts).

---

## 7. Calendar & Deadlines

The **Mini Calendar** is a draggable widget on the dashboard. Open it from the dock if it is not visible.

### Adding a Deadline to a Date
1. Click any **date** on the calendar grid.
2. The view switches to that day's deadline list.
3. Click **"+ ADD DEADLINE"** at the bottom.
4. Type the deadline name/note → press **Enter** or click away to save.
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

**This means:** If you change any row's duration, all rows below it shift their times automatically.

### Setting the Day Start Time
Click the small **"Day Starts: 9:00 AM"** button just below the title. A time picker appears → choose your time → Save.

- This is saved separately for **Weekdays** and **Weekends**.

### Changing a slot's duration
Click any **time cell** in the left column:
- A small editor pops up on that cell.
- Use **▲ +15** / **▼ -15** to adjust in 15-minute steps, or type a number directly (in minutes).
- Press ✓ or Enter to confirm.
- All subsequent row times update automatically.

### Adding / Removing rows
Click the **⚙️** settings icon next to the schedule title:

| Option | What it does |
|---|---|
| Add Top Row | Adds a new slot before row 1 |
| Add Bottom Row | Adds a new slot at the end |
| Delete Top Row | Removes row 1 |
| Delete Bottom Row | Removes the last row |
| Reset Timetable | Resets to a default weekday + weekend schedule |

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

---

## 10. Friends

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
- Click **"My Stats"** button to switch back to your own stats in the same view.

### Friend Request Notifications
When someone sends you a friend request, a **Friend Request popup notification** will appear automatically on your dashboard — so you never miss a request even if Settings is closed.

### Removing a Friend
Click the 🗑️ trash icon next to any friend → confirm.

---

## 11. Leaderboard

**Settings → Connect & News → Ranks tab** (requires login).

### How the Leaderboard Works
- The leaderboard tracks your total accumulated focus time via the Timer.
- It ranks all users by focus time for **Today / This Week / This Month** — toggle at the top.
- Your own row is highlighted in the list.
- Your **alias** is shown if you set one; otherwise your username is shown.
- Use the search bar to find a specific user.
- Click any user row to expand and see their stats breakdown.

### Badges & Achievements
As you accumulate focused work hours, you can earn dynamic badges that appear next to your name on the leaderboard. Badges are awarded automatically to the top user who meets the strict minimum requirements:
- **Daily Badge (🏆)**: Requires a minimum of **6 hours** of focus time in a single day.
- **Weekly Badge (🌟)**: Requires a minimum of **42 hours** of focus time over the last 7 days.
- **Monthly Badge (👑)**: Requires a minimum of **180 hours** of focus time over the last 30 days.

*Note: Badges are incrementable! If you win the daily top spot with 6+ hours multiple times, your badge count will increase (e.g., "🏆 2 Day").*

> Set your alias in **Settings → Connect → Profile → Security & Alias** (requires password unlock) to appear anonymously on the leaderboard.

---

## 12. Roadmap Manager (Plans)

Open from the dock. A powerful, visual roadmap builder for long-term goals and projects.

### Structure — Roadmaps and Topics
- You can have **multiple roadmaps** (e.g. "Semester Goals", "Career Path", "Personal Projects"). Switch between them using the **roadmap name button** at the top of the view.
- Each roadmap is a **tree of topics** — each topic can have subtopics nested up to 4 levels deep.
- On **desktop**, topics alternate left and right along a central timeline. On **mobile**, topics stack in a left-aligned list.

### Adding Topics
1. Click **"Add Main Topic"** at the bottom of the roadmap view to add a root-level topic.
2. Click the **⋮** menu on any existing topic → **➕ Subtopic** to add a nested child topic (up to 4 levels).
3. A new topic is created with the name "New Topic" — click it to open the **Edit Topic** modal.

### Editing a Topic
Click any **leaf topic** (one with no children) directly, or click the **⋮ → Edit** on any topic. Inside the editor:
- **Title** — the topic name.
- **Description (Optional)** — additional notes below the title.
- Click **Save** to confirm.

### Topic Statuses
Each topic has a status you can cycle through by clicking the **status button** (circle icon on the right of the topic card):

| Icon | Status | Card Border Color |
|---|---|---|
| ⚪ | Pending | White/dim |
| 🔵 | In Progress | Blue glow |
| ✅ | Completed | Green |

Completed topics show the title with a strikethrough.

### Filtering by Status
Use the **legend bar** at the top (⚪ Pending / 🔵 In Progress / ✅ Completed) to filter the entire view to show only topics of that status across **all roadmaps** — this is called the **Synthetic View**. Click the active filter again to clear it.

### Roadmap Deadline
Click the **"Set Deadline"** badge at the top of the roadmap tree to set a target completion date. It shows how many days are left. In the Synthetic (filtered) view, you can also set per-status deadlines.

### Managing Roadmaps
- **Create a new roadmap:** Click the roadmap name at the top → **"+ Create Roadmap"** in the switcher popup.
- **Switch roadmaps:** Click the roadmap name at the top → click any roadmap in the list.
- **Delete a roadmap:** Scroll to the bottom of the roadmap view → click **"Delete Entire Roadmap"** (you must type DELETE to confirm).

### Deleting a Topic
Click **⋮** on any topic → **✕ Delete** → type "DELETE" to confirm. This also removes all of that topic's subtopics.

---

## 13. Quick Notes

Open from the dock. A rich-text, multi-note writing space.

### Managing Notes
- **Create a note:** Click the **+** button in the top-right of the Notes sidebar.
- **Switch notes:** Click any note title in the left sidebar (or top list on mobile).
- **Rename a note:** Click the note title text at the top of the editor area and type to rename.
- **Delete a note:** Click the 🗑️ trash icon next to any note in the sidebar (only visible when you have more than one note).

### The Editor
- Notes are **date-sectioned** — each day you write, a new date heading appears automatically. Your existing entries for previous days are preserved and visible below.
- The editor supports full **rich text** formatting:

| Button | Action |
|---|---|
| H1 | Large heading |
| H2 | Medium heading |
| P | Normal paragraph text |
| **B** | Bold |
| *I* | Italic |
| U | Underline |
| ☰ | Bullet list |
| ↩ Undo / ↪ Redo | Undo or redo last change |

- The **floating formatting toolbar** appears at the bottom of the editor — scroll it horizontally on small screens.
- Notes **auto-save** 30 seconds after you stop typing, and immediately when you close the Notes modal.

### Exporting Notes
- **Export a single note:** Click the ⬇️ download icon next to any note in the sidebar — saves as a `.json` file.
- **Export all notes:** Click the ⬇️ export icon in the top-right header of the Notes panel — exports all notes at once.

---

## 14. Health Tracker

Open via the ❤️ icon on the right toolbar.

Log daily metrics to track habits alongside your focus sessions:

| Field | What to log |
|---|---|
| **Academic minutes** | Formal study / coursework time |
| **Reading minutes** | Books, articles, research papers |
| **Vocab words** | New words or concepts learned |

These appear in the **Monthly Breakdown in Stats** alongside your Focus Timer data — giving you a full picture of your learning day.

---

## 15. Stopwatch

Separate from the Focus Timer. Records raw elapsed time for any activity.

- **Start / Pause** — standard start and pause controls.
- **Lap** — records the current time as a split point while continuing to count.
- **Reset** — clears the current session.
- Each completed session is saved with its timestamp and visible in your Stats history.

> Use the Stopwatch for activities where you want to **measure time** without a countdown — e.g. reading sessions, workout durations, or any open-ended work blocks.

---

## 16. Countdowns

A widget showing a list of upcoming target events with day countdowns.

### Mobile Access
- On mobile devices, you can quickly access the Countdowns widget by **swiping down on the top pill/notch area** of the screen.

### Features
- **Add an event:** Click **+** in the Countdowns widget → enter the event name and target date.
- The widget shows **"X days left"** for each event.
- Events within your **Deadline Alert Days** threshold (set in Settings → Preferences) trigger a dashboard popup banner automatically.
- If you have more than one countdown, a **chevron button (▲/▼)** at the bottom of the widget expands or collapses the full list.

---

## 17. Wallpapers

**Settings → Wallpapers**

### Choosing a Wallpaper
- Pick from **built-in wallpapers** — a curated set of images and animated video backgrounds.
- Click a wallpaper thumbnail to make it active immediately.

### Custom Wallpapers via URL
- Add up to **4 custom wallpapers for Desktop** and **4 for Mobile** by pasting an image URL.
- The app stores separate wallpaper sets for desktop and mobile — so your phone gets an appropriately sized background.

### Slideshow Mode
- Toggle **Slideshow** on to have the wallpaper auto-cycle through your active wallpapers.
- Set the **interval in minutes** — e.g. 30 minutes to switch wallpaper every half hour.

### Locking & Hiding Wallpapers
| Option | What it does |
|---|---|
| **Lock** | Slideshow skips this wallpaper — it stays as the permanent background until unlocked |
| **Hide** | Removes the wallpaper from slideshow rotation without deleting it |

---

## 18. Widget Settings & Preferences

**Settings → Preferences**

### Widget Visibility
Toggle any widget on or off. Hidden widgets do not appear on the dashboard at all.

Available toggles: Timer, Clock (with Today's Work), Calendar, Tasks, Notes, Timetable, Health, Stats, Plans (Roadmap), Stopwatch, Countdowns, Dock, Deadline Alerts, Settings Button.

### Widget Drag Locking
- When unlocked, all draggable widgets can be repositioned by dragging.
- Toggle **lock** on any specific widget to prevent it from being moved accidentally. Other widgets remain draggable.
- **Reset Default Positions** — resets ALL draggable widgets back to their original layout positions.

### Right Toolbar Position
Adjust the **vertical height offset** of the right-side toolbar (Health, Stopwatch, etc.). Use the slider to move it up or down to avoid overlapping other elements on your layout.

### Display Options
- **24-Hour Clock** — toggle between 12h AM/PM and 24h military format for the Big Clock.
- **Deadline Alert Days** — how many days before a deadline the alert popup triggers on the dashboard.

### Focus Mode — Specific Widget Setup
In the **Focus / Panic Mode** tab, you can individually select which widgets should be hidden when Focus Mode is triggered — so only your most important widgets remain visible during a focused work session.

---

## 19. Sound Settings

**Settings → Sound Settings**

| Setting | Description |
|---|---|
| **Enable Alarm Sound** | Plays audio when the Focus Timer ends |
| **Enable Device Vibrate** | Vibrates your phone/tablet when the timer ends (mobile only) |
| **Auto Stop Timer** | Slider from 5 seconds to 2 minutes — controls how long the alarm rings before stopping itself automatically |
| **Select Alarm Sound** | Choose from a list of available ringtone options |

---

## 20. Data & Backup

**Settings → Data & Backup**

- **Export Data** — downloads a full `.json` backup of all your data (focus logs, tasks, notes, roadmap, health, etc.). Requires being logged in.
- **Import Data** — upload a `.json` backup file.
  - **Merge:** Combines the backup with your existing data (no data lost from either side).
  - **Overwrite:** Replaces everything with the backup file.
- **Clear Old Data** — delete focus history entries older than a chosen number of days.
- **Clear All Data** — wipes all local data (irreversible).

> **Tip:** Export your backup before clearing browser data or switching devices to avoid losing your local copy.

---

## 21. Feedback & Bugs

**Settings → Feedback & Bugs**

Submit feedback directly to the developer from inside the app:

- **💡 Feature request** — suggest a new feature you'd like to see.
- **🐛 Bug report** — describe something that isn't working correctly.
- **💬 General feedback** — any other comment or message.

View your submission status:
- *Reviewing* — received, not yet looked at
- *Reviewed* — seen by developer
- *✓ Roadmap!* — accepted and planned for a future update

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
| Add a roadmap topic | Roadmap → "Add Main Topic" button |
| Filter roadmap by status | Click ⚪ / 🔵 / ✅ in the Roadmap legend bar |
| Switch roadmaps | Click roadmap name at top of Roadmap view |
| Write and format notes | Notes (dock) — use floating toolbar at bottom |
| Export a single note | Notes sidebar → ⬇️ icon next to note title |
| Export all notes | Notes → ⬇️ icon at top of sidebar |
| Log health data (study/reading/vocab) | ❤️ icon on right toolbar |
| Time an open-ended activity | Stopwatch (right toolbar) |
| Add a countdown event | + button in Countdowns widget |
| Check the leaderboard | Settings → Connect → Ranks tab |
| Add / accept friends | Settings → Connect → Friends tab |
| View a friend's stats | Friends tab → 📊 icon next to their name |
| Backup your data | Settings → Data & Backup → Export |
| Change wallpaper | Settings → Wallpapers |
| Enable slideshow wallpapers | Settings → Wallpapers → Slideshow toggle |
| Hide/show widgets | Settings → Preferences → Widget Visibility |
| Lock widgets in place | Settings → Preferences → Widget Drag Locking |
| Reset widget positions | Settings → Preferences → Reset Default Positions |
| Panic button (mobile) | Tap 👁️ Eye icon on right side of screen |
| Panic / Focus shortcut (desktop) | Settings → Focus / Panic Mode |
| Set alias for leaderboard | Settings → Connect → Profile → Security & Alias |
| Reset password | Login screen → "Forgot Password?" |
| Submit a bug or feature request | Settings → Feedback & Bugs |
| Delete your account | Settings → Connect → Profile → (unlock) → Delete Account |
