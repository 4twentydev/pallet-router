# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**pallet-tracker** is a Next.js 16+ application built with React 19, TypeScript, and Tailwind CSS 4. The project uses the App Router architecture and is configured with shadcn/ui components following the "New York" style variant. The application tracks manufacturing pallet data stored in an Excel file on Microsoft OneDrive.

**Data Source**: The application uses **OneDrive** as the single source of truth, reading and writing to an Excel file (`Release-CheckList.xlsx`) via Microsoft Graph API. Data is cached in-memory and synced periodically (every 2 minutes).

**Note**: The package.json lists the project name as "pallet-router" but the repository and application are referred to as "pallet-tracker".

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm installed
- Microsoft account with OneDrive access
- Azure AD App Registration (for OAuth authentication)
- Excel file with pallet data on OneDrive

### Initial Setup

**IMPORTANT**: Follow the detailed setup guide in `ONEDRIVE_SETUP.md` first to configure Azure AD authentication.

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables:
   Create a `.env.local` file in the project root (see `.env.local.example`):
   ```env
   # Azure AD OAuth Configuration
   AZURE_AD_CLIENT_ID=your_azure_client_id
   AZURE_AD_CLIENT_SECRET=your_azure_client_secret
   AZURE_AD_TENANT_ID=common

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

   # OneDrive Configuration
   ONEDRIVE_FILE_PATH=/Release-CheckList.xlsx
   ```

3. Upload your Excel file to OneDrive:
   - File name: `Release-CheckList.xlsx`
   - Location: Root folder of your OneDrive (or update `ONEDRIVE_FILE_PATH`)
   - Required sheet: `PalletTracker` with specific column structure

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and sign in with your Microsoft account

6. Your pallet data will load automatically from OneDrive!

## Development Commands

### Essential Commands
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint
```

### Database Commands
```bash
# Generate database migrations from schema
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Testing
- **No test framework is currently configured**
- Use `pnpm lint` for code quality checks
- Manual testing via `pnpm dev` is the current testing approach

### Package Management
- **Package Manager**: pnpm (evidenced by pnpm-lock.yaml)
- Use `pnpm install` to install dependencies
- Use `pnpm add <package>` to add new dependencies

## Architecture & Structure

### Technology Stack
- **Framework**: Next.js 16.1.1 with App Router
- **React**: Version 19.2.3
- **TypeScript**: Version 5
- **Data Source**: Microsoft OneDrive (Excel file via Graph API)
- **Authentication**: NextAuth.js 4.24 with Azure AD OAuth
- **Excel Processing**: ExcelJS 4.4.0
- **Microsoft Graph**: @microsoft/microsoft-graph-client 3.0.7
- **Styling**: Tailwind CSS 4 with custom theme
- **UI Components**: shadcn/ui (New York style)
- **Fonts**: Geist Sans and Geist Mono from next/font/google
- **Animation**: Framer Motion
- **Validation**: Zod
- **Date Utilities**: date-fns

**Legacy (Optional)**:
- Vercel Postgres with Drizzle ORM 0.45.1 (can be removed if not needed)

### Directory Structure
```
app/
  layout.tsx          # Root layout with SessionProvider
  page.tsx            # Home page with authentication check
  globals.css         # Global styles and Tailwind config
  actions/            # Next.js Server Actions
    pallets.ts        # Server actions for OneDrive pallet operations
  api/                # API Routes
    auth/             # NextAuth OAuth endpoints
      [...nextauth]/
        route.ts      # NextAuth API route handler
    import/           # Legacy Excel import endpoint (optional)
      route.ts
  components/         # Feature-specific UI components
    pallet-tracker.tsx
    pallet-card.tsx
    job-group.tsx
    filter-bar.tsx
    bulk-actions.tsx
    conflict-dialog.tsx
    progress-indicator.tsx
    theme-toggle.tsx
    session-provider.tsx  # NextAuth session provider wrapper
    auth-status.tsx       # Authentication status and controls
lib/
  auth.ts             # NextAuth configuration with Azure AD
  utils.ts            # Utility functions (cn helper)
  onedrive/           # OneDrive integration layer
    client.ts         # Microsoft Graph client utilities
    service.ts        # OneDrive Excel read/write operations
    sync-manager.ts   # Periodic sync and caching logic
  db/                 # Legacy database layer (optional)
    index.ts          # Drizzle client initialization
    schema.ts         # Database schema definition
    queries.ts        # Database query functions
  excel/              # Excel parsing utilities
    reader.ts
    writer.ts
    utils.ts
    server-utils.ts
types/
  pallet.ts           # TypeScript type definitions
  next-auth.d.ts      # NextAuth type extensions
components/           # shadcn/ui components
  ui/                 # UI component directory (created when first shadcn component is added)
```

### Path Aliases
The following import aliases are configured in tsconfig.json and components.json:
```typescript
@/*           // Maps to project root
@/components  // Maps to components directory
@/lib         // Maps to lib directory
@/utils       // Maps to lib/utils
@/ui          // Maps to components/ui
@/hooks       // Maps to hooks directory
```

Always use these aliases for imports instead of relative paths.

## Styling System

### Tailwind CSS 4
This project uses Tailwind CSS 4 with the new `@theme inline` directive in globals.css. Key differences from Tailwind CSS 3:
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Theme configuration is inline in globals.css using `@theme inline {}`
- Custom dark mode variant defined with `@custom-variant dark (&:is([data-theme="dark"] *))`

### Design System
The project has a comprehensive style guide in **STYLE_GUIDE.md** that documents:
- Color system (light/dark themes with custom CSS variables)
- Typography patterns (Geist Sans primary, Geist Mono for code)
- Component patterns (buttons, cards, forms, badges, etc.)
- Layout structures (two-column grids, responsive patterns)
- Spacing system and border radius conventions
- Animation patterns using Framer Motion
- Accessibility guidelines

**Important**: When creating new components or pages, refer to STYLE_GUIDE.md for consistent design patterns. The style guide uses custom CSS variables for theming:
- Use `var(--background)`, `var(--foreground)`, `var(--surface)`, etc.
- Use semantic color classes like `text-strong`, `text-muted`, `border-subtle`
- Follow the established border radius scale: `rounded-2xl` for inputs, `rounded-3xl` for cards, `rounded-full` for buttons

### shadcn/ui Configuration
- **Style**: new-york
- **Base Color**: neutral
- **CSS Variables**: Enabled
- **Icon Library**: lucide-react
- **Component Directory**: `components/ui/` (created when first component is added)
- **Note**: No shadcn/ui components are currently installed; the project is configured and ready to add them as needed

### Theme Colors
Both light and dark themes are preconfigured with semantic color tokens defined in globals.css:
- Core: `--background`, `--foreground`, `--surface`, `--surface-muted`
- Borders: `--border`, `--border-strong`
- Text: `--muted`, `--muted-strong`
- Accents: `--accent-primary`, `--accent-secondary`
- Status: `--success`, `--error`, `--warning`

**Theme Control:**
- Default theme: Light mode (`data-theme="light"` set in layout.tsx)
- Theme toggle: Available via `ThemeToggle` component in `app/components/theme-toggle.tsx`
- Theme switching: Set the `data-theme` attribute on the HTML element to `"dark"` or `"light"`

### Utility Function
The `cn()` helper in `lib/utils.ts` combines clsx and tailwind-merge for conditional className composition:
```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-class", condition && "conditional-class")} />
```

## TypeScript Configuration

- **Target**: ES2017
- **JSX**: react-jsx
- **Module Resolution**: bundler
- **Strict Mode**: Enabled
- All TypeScript files use `.ts` or `.tsx` extensions
- Type checking is strict; ensure all new code is properly typed

## Application Architecture

### Data Flow & OneDrive Integration
This application manages pallet tracking data stored in an Excel file on Microsoft OneDrive, accessed via Microsoft Graph API.

**Key Architecture Patterns:**

1. **OneDrive as Source of Truth**: An Excel file (`Release-CheckList.xlsx`) on OneDrive is the single source of truth. All reads and writes go through Microsoft Graph API via `lib/onedrive/service.ts`.

2. **OAuth Authentication**: Users authenticate via NextAuth.js with Azure AD OAuth:
   - Configuration in `lib/auth.ts`
   - API routes in `app/api/auth/[...nextauth]/route.ts`
   - Session management via `SessionProvider` in layout
   - Access tokens are automatically refreshed when expired

3. **Periodic Sync Architecture**: Data is cached in-memory and synced every 2 minutes:
   - **Sync Manager** (`lib/onedrive/sync-manager.ts`): Singleton that manages caching and periodic syncing
   - **Cache**: In-memory storage of pallet data for fast reads
   - **Pending Changes**: Local modifications are batched and written to OneDrive on next sync
   - **Auto-Sync**: Background timer syncs every 2 minutes automatically
   - **Manual Sync**: Users can trigger immediate sync via "Sync Now" button

4. **Server Actions for Data Operations** (`app/actions/pallets.ts`):
   - `getPalletData()` - Reads pallet data (from cache or OneDrive)
   - `togglePalletStatus()` - Toggles a single pallet's "Made" status (cached, synced later)
   - `bulkTogglePallets()` - Bulk updates multiple pallets (cached, synced later)
   - `forceSyncWithOneDrive()` - Forces immediate sync with OneDrive
   - All actions require authenticated session with valid access token

5. **Excel File Structure**:
   - **File Name**: `Release-CheckList.xlsx` (configurable via `ONEDRIVE_FILE_PATH`)
   - **Sheet Name**: `PalletTracker` (required)
   - **Columns**:
     1. Job Number (text, required)
     2. Release Number (text, required)
     3. Pallet Number (text, required)
     4. Size (text, optional)
     5. Elevation (text, optional)
     6. Made (text, "X" = completed, empty = pending)
     7. Acc List (text, optional - accessories list)
     8. Shipped Date (text, optional)
     9. Notes (text, optional)

6. **Type Safety**: The `types/pallet.ts` file defines all domain types:
   - `PalletTask` - Individual pallet item with computed status
   - `JobGroup` - Grouped pallets by job/release with progress metrics
   - `PalletData` - Full dataset with metadata
   - `FileMetadata` - Metadata for versioning (mtime, version hash, readOnly flag)
   - `ServerActionResult<T>` - Standardized server action response

7. **Pallet ID Format**: `${jobNumber}::${releaseNumber}::${palletNumber}`
   - Uses `::` delimiter to handle hyphens in release numbers
   - Uniquely identifies each pallet across the system
   - Example: `"24-101::R1::1"` represents Job 24-101, Release R1, Pallet 1

### OneDrive Layer (`lib/onedrive/`)

**`lib/onedrive/client.ts`**: Microsoft Graph API client utilities
- `createGraphClient()` - Creates authenticated Graph client
- `getFileIdByPath()` - Resolves OneDrive file path to file ID
- `downloadFile()` - Downloads Excel file content from OneDrive
- `uploadFile()` - Uploads modified Excel file to OneDrive
- `getFileMetadata()` - Gets file modification time and size

**`lib/onedrive/service.ts`**: Excel file read/write operations
- `readPalletDataFromOneDrive()` - Downloads and parses Excel file to pallet data
- `writePalletDataToOneDrive()` - Updates Excel file with new pallet data
- `updatePalletMadeOnOneDrive()` - Updates single pallet's "Made" status
- `bulkUpdatePalletsMadeOnOneDrive()` - Bulk updates multiple pallets
- Uses ExcelJS to parse and modify Excel workbooks

**`lib/onedrive/sync-manager.ts`**: Periodic sync and caching logic
- Singleton service managing in-memory cache
- Automatic periodic sync every 2 minutes
- Batches local changes and writes to OneDrive
- Provides sync status and manual sync trigger

**`lib/db/queries.ts`**: Database query functions
- `getPallets()` - Fetches all pallets, converts to `PalletTask[]`
- `updatePalletMade()` - Updates single pallet's made status
- `bulkUpdatePalletsMade()` - Updates multiple pallets
- `insertPallet()` - Inserts single pallet
- `insertPallets()` - Batch inserts (used for Excel import)
- `deleteAllPallets()` - Truncates pallets table (used before re-import)

### Authentication Layer (`lib/auth.ts`)

**NextAuth Configuration**:
- Provider: Azure AD (Microsoft OAuth)
- Scopes: `openid profile email User.Read Files.ReadWrite.All offline_access`
- Token Management: Automatic token refresh on expiration
- Callbacks: JWT callback persists access tokens, session callback exposes them to client

### Configuration Files

**`.env.local`** (Required environment variables):
```env
# Azure AD OAuth (required for OneDrive access)
AZURE_AD_CLIENT_ID=your_azure_client_id
AZURE_AD_CLIENT_SECRET=your_azure_client_secret
AZURE_AD_TENANT_ID=common  # Use "common" for personal Microsoft accounts

# NextAuth (required for authentication)
NEXTAUTH_URL=http://localhost:3000  # Update for production
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# OneDrive file path (optional, defaults to /Release-CheckList.xlsx)
ONEDRIVE_FILE_PATH=/Release-CheckList.xlsx

# Legacy (optional, can be removed if not using Postgres)
# POSTGRES_URL=your_postgres_connection_string
```

**See `ONEDRIVE_SETUP.md`** for detailed Azure AD app registration and configuration instructions.

### Component Structure
Components in `app/components/` are feature-specific and follow these patterns:
- **pallet-tracker.tsx**: Main orchestrator component managing state and data fetching
- **job-group.tsx**: Displays grouped pallets by job/release with progress tracking
- **pallet-card.tsx**: Individual pallet display with toggle functionality
- **filter-bar.tsx**: Search and filter controls
- **bulk-actions.tsx**: Bulk selection and update controls
- **conflict-dialog.tsx**: Handles conflicts when data changes externally
- **progress-indicator.tsx**: Visual progress bars for job completion
- **theme-toggle.tsx**: Light/dark theme switcher
- **session-provider.tsx**: NextAuth session provider wrapper for client components
- **auth-status.tsx**: Authentication status display with sign in/out and manual sync controls

### Data Sync Flow
The application syncs data with OneDrive on a periodic schedule:

1. **Initial Load**:
   - User signs in with Microsoft account
   - App downloads Excel file from OneDrive
   - Parses data and stores in memory cache
   - Displays pallet data in UI

2. **User Updates**:
   - User marks pallets as completed
   - Changes are stored in local cache immediately
   - UI updates instantly for responsiveness
   - Changes marked as "dirty" for next sync

3. **Periodic Sync** (every 2 minutes):
   - Sync manager checks for pending changes
   - Writes all changes to OneDrive Excel file
   - Reads latest data from OneDrive
   - Updates cache with fresh data
   - Resolves any conflicts (OneDrive wins)

4. **Manual Sync**:
   - User clicks "Sync Now" button
   - Triggers immediate sync cycle
   - Shows syncing status in UI

**Conflict Resolution**: If the file was modified externally (e.g., opened in Excel), the OneDrive version takes precedence during sync

   # Import Excel data (with authentication if IMPORT_SECRET_KEY is set)
   curl -X POST http://localhost:3000/api/import \
     -H "Authorization: Bearer your-secret-key"

   # Check import endpoint info
   curl http://localhost:3000/api/import
   ```

2. **Excel Utilities** (`lib/excel/`):
   - `reader.ts` - Reads Excel files and parses pallet data
   - `writer.ts` - Exports database data to Excel format
   - `utils.ts` - Shared Excel parsing utilities
   - `server-utils.ts` - Server-side Excel operations

## Component Development

### Adding shadcn/ui Components
Use the shadcn CLI to add new components:
```bash
pnpm dlx shadcn@latest add <component-name>
```

Components will be installed in `components/ui/` with the New York style variant.

### Font Loading
Fonts are loaded in the root layout using next/font/google:
```typescript
import { Geist, Geist_Mono } from "next/font/google";
```

Both fonts are available as CSS variables:
- `--font-geist-sans` for body text
- `--font-geist-mono` for code/monospace content

## Common Workflows

### Making Schema Changes
1. Update the schema in `lib/db/schema.ts`
2. Generate migration files: `pnpm db:generate`
3. Review generated migration in `drizzle/` directory
4. Apply migration to database: `pnpm db:push`
5. Update related types in `types/pallet.ts` if needed
6. Update query functions in `lib/db/queries.ts` to use new schema

### Adding a New Server Action
1. Add the function to `app/actions/pallets.ts`
2. Import required query functions from `lib/db/queries.ts`
3. Implement error handling with try/catch
4. Return a `ServerActionResult` object
5. Call `revalidatePath('/')` after mutations to update cached data
6. Add corresponding UI handler in component

### Importing Data from Excel
1. **Ensure Excel file exists** at `data/Release-CheckList.xlsx` (must be present before import)
2. Ensure `POSTGRES_URL` environment variable is set
3. Optionally set `IMPORT_SECRET_KEY` for authentication
4. Start the dev server: `pnpm dev`
5. Run: `curl -X POST http://localhost:3000/api/import`
6. Check response for success/error status

### Updating Application Metadata
The `app/layout.tsx` file contains default Next.js metadata that should be updated:
```typescript
export const metadata: Metadata = {
  title: "Pallet Tracker",  // Currently "Create Next App"
  description: "Manufacturing pallet tracking application",
};
```

### Adding a New Component
1. Create component file in `app/components/` (for feature components) or `components/ui/` (for shadcn components)
2. Use `'use client'` directive only if needed (hooks, events, browser APIs)
3. Import styling utilities: `import { cn } from "@/lib/utils"`
4. Reference STYLE_GUIDE.md for consistent styling patterns
5. Use path aliases (`@/`) for all imports
6. Test in both light and dark themes

## Best Practices

### OneDrive Operations
- Always use server actions for data mutations (never call OneDrive directly from client)
- Ensure user is authenticated before accessing OneDrive (check session in server actions)
- Use the sync manager (`lib/onedrive/sync-manager.ts`) for all data operations
- Handle OneDrive errors gracefully with try/catch (network issues, permission errors)
- Return standardized `ServerActionResult` from server actions
- Use `revalidatePath('/')` after mutations to update cached data
- Trust the periodic sync mechanism - don't force sync after every change

### Imports
- Always use path aliases (`@/`) instead of relative imports
- Import only what you need from libraries

### Styling
- Use the `cn()` utility for combining class names
- Prefer Tailwind classes over custom CSS
- Reference STYLE_GUIDE.md for consistent component patterns
- Use CSS variables for theme colors to support light/dark mode
- Follow the established border radius conventions from the style guide

### Components
- Use React Server Components by default (no 'use client' directive unless needed)
- Add 'use client' only when using hooks, event handlers, or browser APIs
- Follow the shadcn/ui patterns for component composition

### Code Quality
- Write type-safe TypeScript
- Use semantic HTML elements
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test components in both light and dark themes

## Important Files

- **`ONEDRIVE_SETUP.md`** - Detailed OneDrive and Azure AD setup guide (START HERE)
- **`.env.local.example`** - Environment variable template
- `STYLE_GUIDE.md` - Comprehensive design system documentation
- `AGENTS.md` - Repository guidelines and conventions
- `components.json` - shadcn/ui configuration
- `app/globals.css` - Tailwind config and theme variables
- `lib/auth.ts` - NextAuth configuration with Azure AD
- `lib/onedrive/client.ts` - Microsoft Graph API client
- `lib/onedrive/service.ts` - OneDrive Excel operations
- `lib/onedrive/sync-manager.ts` - Periodic sync and caching
- `lib/utils.ts` - Shared utility functions
- `types/pallet.ts` - Domain type definitions
- `types/next-auth.d.ts` - NextAuth type extensions
- `tsconfig.json` - TypeScript configuration with path aliases

**Legacy (Optional)**:
- `lib/db/schema.ts` - Database schema definition (can be removed)
- `lib/db/queries.ts` - Database query functions (can be removed)
- `drizzle.config.ts` - Drizzle ORM configuration (can be removed)
