# Connect 4
(React + TypeScript + Vite) <br/> <br/>

> This project  was created to play connect four against another human or various AI difficulties [WIP] <br/>
> [Live - Connect 4 Website](https://connect-4.ryan-brock.com/)

---

## 📚 Table of Contents

- [What's My Purpose?](#-whats-my-purpose)
- [How to Use](#-how-to-use)
- [Technologies](#-technologies)
- [Getting Started (Local Setup)](#-getting-started-local-setup)
  - [Run Locally](#run-locally)
  - [GitHub Hooks](#github-hooks)
  - [Build](#build)
  - [Deploy](#deploy)

---

## 🧠 What's My Purpose?

This is a server side single-page react frontend created to play Connect 4 against another human or various AI difficulties [WIP]. I've enjoyed Connect 4 since high school, where a particular teacher (and football coach) was very good and I had to rise to the occasion as competition. I created this application in the Summer of 2025 when I was unemployed (laid off).  

---

## 🚦 How to Use

- `Select Color` - Yellow is selected by default
- `Select Player 2`
  - Human
  - AI - Easy -> 20% chance to block threat (win), 80% random (of available moves)
  - AI - Medium -> First look for winning move. Then 80% chance to block threat (win). Last is to find a strategic move and if that doesn't work the fallback is a random move
  - AI - Hard -> First look for winning move. Then block all threats (wins). Find safe moves (that don't give Player 1 a chance to win). Find harder strategic moves from that set and if all fail, fallback to a random move
  - AI - Iterative -> This version learns as you play. It will be harder and harder to win the more games playes

<br/><br/>
Other Actions
  - `Clear Board` - Can only be done after a game is started and is used to reset or restart a Connect 4 game
---

## 🛠 Technologies

- Framework: `React 19`
- Styles: `Tailwind CSS`
- Deployment: `GitHub Pages`

---

## 🚀 Getting Started (Local Setup)

* Install [node](https://nodejs.org/en) - v19 is needed (v22 also works)
* Clone [repo](https://github.com/rbrock44/connect-4)

---

### Run Locally

```
npm install
npm start
```

---

### Github Hooks

- Build
    - Trigger: On Push to Main
    - Action(s): Builds application then kicks off gh page action to deploy build output

---

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

---

### Deploy

Run `npm run prod` to build and deploy the project. Make sure to be on `master` and that it is up to date before running the command. It's really meant to be a CI/CD action

---
