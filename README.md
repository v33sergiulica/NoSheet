# 🃏 No Sheet

> **"No Sheet"** — because every single game night, nobody has a pen, the paper is missing, and someone is writing scores on a ripped napkin with a dried-out marker. No sheet, just play.

<p align="center">
  <img src="./public/icon.png" width="160" alt="No Sheet Logo" style="border-radius: 24px;" />
</p>

A fast, no-nonsense score table generator you can pull out at game night on any phone or laptop. 

---

### Why we made this

Most scoreboard apps either look like spreadsheets from 1998, cost \$4.99/month, or force you into rigid rules. Unity was too heavy, so we made this clean, lightweight web app instead.

* **Custom Column Thickness (`2 1 2 1`):** In games like Whist, Romanian Whist, or Oh Hell, you need a tiny box for a single-digit guess/bid, and a wider box for the actual score. Just type `2 1 2 1` and you're set.
* **Merged Player Headers:** Put `P1`, `P2`, `P3` (or your friends' names) across pairs of columns without annoying clutter.
* **Circular & Numbered Rounds:** Cycle rounds by player order (`P1 P2 P3 P4`), round numbers (`Round 1, Round 2...`), or clean raw digits.
* **Fast Native Typing:** Tap any cell and your phone's native keyboard pops up immediately. No clunky modals.
* **Crash-Proof:** Saves every keystroke instantly to your phone's storage. If someone accidentally closes the tab or locks their phone, your game is right where you left it.
* **Saved Games:** Keeps a history of your past game nights so you can settle arguments about who actually won last week.
* **Warm Paper & Warm Espresso Themes:** Switch between a warm parchment daylight mode and a cozy, late-night espresso dark mode that won't blind you across the table.
* **Zero App Store BS:** Open the link on your phone, tap **"Add to Home Screen"**, and it installs as a full-screen app with its own icon.

---

### Running it locally

If you have Node.js installed:

```bash
# Clone the repo
git clone https://github.com/v33sergiulica/NoSheet.git
cd NoSheet

# Install dependencies
npm install

# Start the game
npm run dev
```

*(On Windows, you can also just double-click `start.bat`!)*
