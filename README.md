# LCI Database Manager 🗄️

A modern, interactive web-based database management system built as a final project for the **Databases 1** course at **Collège LaSalle Montréal**. This application provides a comprehensive interface for managing SQL databases with support for creating tables, managing data, and visualizing database schemas.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Our Team](#our-team)
- [Contributing](#contributing)
- [License](#license)

## Overview

**LCI Database Manager** is a full-stack web application that demonstrates practical implementation of database concepts including normalization (3NF), schema design, SQL operations, and modern web development practices. The project combines theoretical database knowledge with hands-on implementation through an interactive user interface.

This project was developed under the guidance of **Professor Huu Con Nguyen** and showcases our team's expertise in both database design and web development.

## Features

✅ **Interactive Database Management**

- Create, edit, and delete database tables with a user-friendly interface
- Add, update, and remove rows with validation
- Support for primary keys, foreign keys, unique constraints, and check constraints
- Real-time data filtering and searching

✅ **Advanced Table Operations**

- Sortable columns with visual indicators
- Pagination for large datasets
- Column type enforcement and validation
- Constraint visualization (PK, FK, UQ, CHK badges)

✅ **SQL Command Integration**

- Comprehensive SQL command reference (50+ commands)
- Support for DDL, DML, DQL operations
- Transaction management
- User and permission management

✅ **3NF Compliant Schema**

- Properly normalized database structure
- Seven-table relational schema (Customers, Categories, Suppliers, Products, Orders, Order_Details, System_Users)
- Entity-relationship diagram visualization

✅ **Modern UI/UX**

- Responsive design for all devices
- Dark theme enforced for better visual experience
- Interactive dialogs and modals
- Toast notifications for user feedback
- Smooth animations and transitions

✅ **Database Reporting**

- Schema analysis and visualization
- SQL feature implementation showcase
- Mermaid diagram integration for ER diagrams

## Technologies Used

### Frontend

- **[Svelte 5](https://svelte.dev/)** - Modern reactive JavaScript framework
- **[SvelteKit](https://kit.svelte.dev/)** - Full-stack Svelte framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn-svelte](https://www.shadcn-svelte.com/)** - Reusable UI component library
- **[Bits UI](https://www.bits-ui.com/)** - Headless UI components

### Backend

- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Neon Database](https://neon.tech/)** - Serverless PostgreSQL
- **[@neondatabase/serverless](https://www.npmjs.com/package/@neondatabase/serverless)** - PostgreSQL client for serverless environments
- **[Axios](https://axios-http.com/)** - HTTP client for API requests

### Development Tools

- **[Vite](https://vitejs.dev/)** - Fast build tool and development server
- **[ESLint](https://eslint.org/)** - JavaScript linter
- **[Prettier](https://prettier.io/)** - Code formatter
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript-specific linting rules

### Additional Libraries

- **[Marked](https://marked.js.org/)** - Markdown parser
- **[Mermaid](https://mermaid.js.org/)** - Diagram and chart generation
- **[Highlight.js](https://highlightjs.org/)** - Syntax highlighting
- **[Svelte Sonner](https://svelte-sonner.vercel.app/)** - Toast notifications
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon set
- **[Mode Watcher](https://github.com/huntabyte/mode-watcher)** - Theme management

## Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **pnpm** or **yarn**
- A **Neon Database** account (or any PostgreSQL database)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/shayandelbari/lci-database-manager.git
   cd lci-database-manager
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with your database connection string:

   ```env
   DATABASE_URL=your_neon_database_connection_string
   ```

4. **Run database migrations (optional):**

   If you have SQL scripts in the `docs/` directory, you can run them against your database to set up the initial schema.

5. **Start the development server:**

   ```bash
   npm run dev
   # or start the server and open the app in a new browser tab
   npm run dev -- --open
   ```

6. **Access the application:**

   Navigate to `http://localhost:5173` in your browser.

## Usage

### Database Manager

1. Navigate to `/database-manager` to access the main database management interface
2. Select a table from the dropdown to view and manage its data
3. Use the **Create Table** button to add new tables with custom columns and constraints
4. **Add Row** to insert new data into the selected table
5. **Edit** or **Delete** rows using the action buttons in each row
6. Apply **filters** to search and filter data based on column values
7. Use **sorting** by clicking on column headers

### SQL Command Reference

Visit the application to view a comprehensive guide of 50+ SQL commands organized by category:

- Data Retrieval (SELECT, GROUP BY, HAVING, etc.)
- Data Manipulation (INSERT, UPDATE, DELETE)
- Data Definition (CREATE TABLE, ALTER TABLE, DROP TABLE)
- Constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, NOT NULL)
- Transactions (COMMIT, ROLLBACK, SAVEPOINT)
- User Management (CREATE USER, GRANT, DROP USER)
- And much more!

### Building for Production

To create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

To start the production server:

```bash
npm start
```

> **Note:** You may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target deployment environment. This project includes both `@sveltejs/adapter-node` and `@sveltejs/adapter-vercel`.

## Project Structure

```plaintext
lci-database-manager/
├── docs/                          # SQL scripts and documentation
│   ├── 1.sql through 8.sql       # Database implementation scripts
├── src/
│   ├── lib/
│   │   ├── components/           # Reusable Svelte components
│   │   │   ├── db-command/       # SQL command documentation
│   │   │   ├── filter-dialog/    # Data filtering interface
│   │   │   ├── home/             # Home page component
│   │   │   ├── report/           # Database analysis report
│   │   │   ├── row-dialog/       # Row add/edit dialog
│   │   │   ├── table-dialog/     # Table creation dialog
│   │   │   └── ui/               # shadcn-svelte UI components
│   │   ├── server/               # Server-side code
│   │   │   └── db/               # Database connection and queries
│   │   ├── stores/               # Svelte stores for state management
│   │   │   ├── database.ts       # Database state
│   │   │   ├── databaseStore.ts  # Database operations
│   │   │   └── tableStore.ts     # Table operations and data
│   │   ├── types/                # TypeScript type definitions
│   │   └── utils/                # Utility functions
│   ├── routes/                   # SvelteKit routes
│   │   ├── api/                  # API endpoints
│   │   ├── database-manager/     # Database manager page
│   │   ├── report/               # Report page
│   │   ├── +layout.svelte        # Root layout
│   │   └── +page.svelte          # Home page
│   ├── app.css                   # Global styles
│   └── app.html                  # HTML template
├── static/                       # Static assets
├── .prettierrc                   # Prettier configuration
├── eslint.config.js              # ESLint configuration
├── package.json                  # Dependencies and scripts
├── svelte.config.js              # Svelte configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── sql-command-summary.md        # SQL commands reference
└── README.md                     # This file
```

## Database Schema

The database implements a **Third Normal Form (3NF)** compliant schema with the following tables:

- **Customers** - Customer personal information
- **Categories** - Product categorization
- **Suppliers** - Supplier information
- **Products** - Inventory management with relationships
- **Orders** - Order headers with customer references
- **Order_Details** - Many-to-many relationship between orders and products
- **System_Users** - System access and permissions

For detailed schema analysis and implementation, visit the `/report` page in the application.

## Our Team

This project was collaboratively developed by a dedicated team of students from **Collège LaSalle Montréal**:

- **[Abdulrahman Mousa](https://github.com/abdulrahman)** – Website Frontend, database integration specialist
- **[Shayan Delbari](https://github.com/shayandelbari)** – Website Backend, server-side database interactions
- **Sofia Saldumbide Rissotto** – Database design and implementation specialist
- **Akshay Kheterpal** – Database normalization and optimization specialist

**Course Instructor:** Professor Huu Con Nguyen

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Run linting and formatting:
   ```bash
   npm run lint
   npm run format
   ```
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature-branch`)
7. Open a Pull Request

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the LCI Database Management Team**
