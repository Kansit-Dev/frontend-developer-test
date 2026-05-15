# Task Dashboard

A modern, responsive Task Dashboard built with Next.js, React, Tailwind CSS, and dnd-kit. This project allows users to manage tasks across different statuses (To Do, In Progress, Done) with drag-and-drop functionality, comprehensive filtering, and a seamless search experience.

## Features

- **Drag and Drop**: Easily move tasks between "To Do", "In Progress", and "Done" using `@dnd-kit`.
- **Search & Filter**: 
  - Real-time search across task titles, tags, and status.
  - Smart status search allowing spaces and hyphens (e.g., searching "in progress" or "todo").
  - Filter tasks by Priority and Status.
  - Automatically switches to a 3x3 grid layout when searching or filtering.
- **Task Management**: Create, edit, and view detailed task information via an interactive popup.
- **Pagination**: Supports pagination within columns and handles dynamic pagination during filtering.
- **Responsive Design**: Fully responsive layout that works smoothly on both desktop and mobile devices.
- **Dark Mode**: Built-in dark mode toggle for better accessibility.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

First, install dependencies:

```bash
pnpm install
# or
npm install
# or
yarn install
```

Then, run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Constraints

- The default task display uses individual columns per status, allowing 3 items per page per column.
- When searching or applying filters, the interface elegantly collapses into a paginated 3x3 grid (9 items per page) to maximize result visibility.