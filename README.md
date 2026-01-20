# Pallet Tracker

A modern manufacturing pallet tracking application built with Next.js, integrating with Microsoft OneDrive for real-time data synchronization.

## Features

- 📊 **OneDrive Integration**: Excel file on OneDrive as single source of truth
- 🔄 **Automatic Sync**: Periodic syncing every 2 minutes with manual sync option
- 🔐 **Microsoft Authentication**: Secure OAuth login with Azure AD
- ⚡ **Real-time Updates**: Instant UI updates with background sync to OneDrive
- 🎨 **Modern UI**: Built with React 19, Tailwind CSS 4, and shadcn/ui components
- 🌙 **Dark Mode**: Full light/dark theme support
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Microsoft account with OneDrive
- Azure AD App Registration (see setup guide)

### Setup

1. **Follow the detailed setup guide**: See [`ONEDRIVE_SETUP.md`](./ONEDRIVE_SETUP.md) for complete Azure AD configuration

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Azure AD credentials
   ```

4. **Upload Excel file to OneDrive**:
   - Upload `Release-CheckList.xlsx` to your OneDrive root folder
   - Ensure it has a sheet named `PalletTracker` with the correct structure

5. **Start the development server**:
   ```bash
   pnpm dev
   ```

6. **Open the app**: Visit [http://localhost:3000](http://localhost:3000)

7. **Sign in**: Click "Sign in with Microsoft" and authorize OneDrive access

## How It Works

### Data Flow

1. **Authentication**: Users sign in with their Microsoft account using OAuth
2. **OneDrive Access**: App gets permission to read/write Excel files on OneDrive
3. **Data Loading**: Excel file is downloaded and parsed into pallet data
4. **Local Cache**: Data is cached in memory for fast access
5. **User Updates**: Changes are stored locally and synced to OneDrive every 2 minutes
6. **Conflict Resolution**: OneDrive version takes precedence during sync

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Authentication**: NextAuth.js with Azure AD
- **Data Source**: Microsoft OneDrive (Excel via Graph API)
- **Excel Processing**: ExcelJS

## Documentation

- **[ONEDRIVE_SETUP.md](./ONEDRIVE_SETUP.md)** - Complete setup guide for Azure AD and OneDrive
- **[CLAUDE.md](./CLAUDE.md)** - Technical documentation and architecture guide
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - UI design system and component patterns

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Project Structure

```
app/
  actions/          # Server actions for OneDrive operations
  api/auth/         # NextAuth OAuth endpoints
  components/       # React components
lib/
  auth.ts           # NextAuth configuration
  onedrive/         # OneDrive integration layer
    client.ts       # Microsoft Graph client
    service.ts      # Excel read/write operations
    sync-manager.ts # Periodic sync and caching
types/
  pallet.ts         # TypeScript type definitions
  next-auth.d.ts    # NextAuth type extensions
```

## Troubleshooting

### Common Issues

**"Not authenticated" error**
- Verify Azure AD credentials in `.env.local`
- Try signing out and signing back in

**"File not found" error**
- Check that the Excel file exists on OneDrive
- Verify `ONEDRIVE_FILE_PATH` matches the actual file path

**Permission errors**
- Ensure `Files.ReadWrite.All` permission is granted in Azure Portal
- Try revoking and re-granting consent

See [ONEDRIVE_SETUP.md](./ONEDRIVE_SETUP.md) for detailed troubleshooting.

## License

This project is proprietary software for Elward Systems.

## Support

For issues or questions, refer to:
- Azure Portal for authentication configuration
- Browser console for client-side errors
- Server logs for backend issues
