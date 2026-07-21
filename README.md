# ProsperDriver — Financial Control

**A web app for rideshare drivers to track their real earnings** (Uber, 99, inDrive, Cabify).

🔗 **Live demo:** [app.labdeingresos.com](https://app.labdeingresos.com) · [prosperdriver.vercel.app](https://prosperdriver.vercel.app)

---

## The problem

Rideshare drivers rarely have a simple way to know if they're actually making money. They get paid per trip, but fuel, maintenance, tolls, and other operating costs are almost never factored in — so most drivers don't know their **real profit per hour or per kilometer**, or whether a given platform is even worth their time.

ProsperDriver solves this by centralizing income and expenses per shift, and automatically calculating the profitability metrics a driver needs to make informed decisions.

## Features

- **Main Dashboard** — daily summary: gross revenue, total expenses, net profit and margin
- **Live Shift Tracking** — start/pause/end a shift with a real-time timer, tracking start time and starting mileage automatically
- **Earnings / Expense Logging** — quick entry by platform and expense category
- **History** — three complementary visualizations:
  - Cumulative area chart (earnings vs expenses over time)
  - Donut chart of expenses by category (Fuel, Tires, Other...)
  - Daily earnings vs expenses comparison (last 7 days)
- **Reports** — per-shift breakdown with automatic **earnings per km** and **earnings per hour** calculations, so drivers can compare how efficient each shift really was
- **Goals** — monthly revenue and net profit targets, with daily goals dynamically prorated based on the days remaining in the month
- **Multi-language** — Portuguese, Spanish, and English
- **Multi-platform** — supports logging income from Uber, 99, inDrive, and Cabify



## Tech stack

- React + Vite
- Chart.js (area, bar, and donut charts)
- Plain CSS (responsive, mobile-first design)
- Continuous deployment on Vercel

## Screenshots

<img width="720" height="1600" alt="Prosperdriver01" src="https://github.com/user-attachments/assets/139b59b9-b4e9-474b-9512-55e93c2f1756" />
<img width="720" height="1600" alt="prosperdriver04" src="https://github.com/user-attachments/assets/c45743ec-3b34-4626-936c-1c33f8af4e00" />
<img width="720" height="1600" alt="prosperdriver03" src="https://github.com/user-attachments/assets/fb739745-da1d-40d4-b716-0e1603a8f3c0" />
<img width="720" height="1600" alt="Prosperdriver02" src="https://github.com/user-attachments/assets/66776666-e4e1-4731-bd7b-64ceb823424b" />

## Motivation

This project was built from firsthand experience working as a rideshare driver in Brazil — identifying, in practice, the lack of simple tools to measure the real profitability of a day's work.

## Roadmap

- [ ] PDF report export
- [ ] Integration with Prosper Finance (personal finance organization app)
- [ ] Daily goal notifications

---

**Author:** Alex Font — [GitHub](https://github.com/alexpfont982-netizen)
