# OneDrive Setup Guide

This guide will help you set up OneDrive integration for the Pallet Tracker application.

## Prerequisites

- A Microsoft account with OneDrive access
- Node.js 18+ and pnpm installed
- Your pallet tracking Excel file (`Release-CheckList.xlsx`)

## Step 1: Create Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `Pallet Tracker` (or any name you prefer)
   - **Supported account types**: Choose "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**:
     - Platform: `Web`
     - URI: `http://localhost:3000/api/auth/callback/azure-ad`
5. Click **Register**

## Step 2: Configure App Registration

### Add Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description (e.g., "Pallet Tracker Secret")
4. Choose expiration (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the secret **value** immediately (you won't be able to see it again)

### Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph** > **Delegated permissions**
4. Add the following permissions:
   - `User.Read` (should already be there)
   - `Files.ReadWrite.All`
   - `offline_access`
5. Click **Add permissions**
6. (Optional) Click **Grant admin consent** if you have admin rights

### Configure Authentication

1. Go to **Authentication**
2. Under **Implicit grant and hybrid flows**, enable:
   - **ID tokens**
3. Click **Save**

## Step 3: Upload Excel File to OneDrive

1. Sign in to [OneDrive](https://onedrive.live.com)
2. Upload your `Release-CheckList.xlsx` file to the **root folder** of your OneDrive
3. Verify the file is accessible and has the correct structure:
   - Sheet name: `PalletTracker`
   - Columns: Job Number, Release Number, Pallet Number, Size, Elevation, Made, Acc List, Shipped Date, Notes

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in the values:

   ```env
   # From Azure App Registration Overview page
   AZURE_AD_CLIENT_ID=your_application_client_id

   # The secret value you copied earlier
   AZURE_AD_CLIENT_SECRET=your_client_secret_value

   # Use "common" for personal Microsoft accounts
   AZURE_AD_TENANT_ID=common

   # Your app URL (change for production)
   NEXTAUTH_URL=http://localhost:3000

   # Generate a random secret (run: openssl rand -base64 32)
   NEXTAUTH_SECRET=your_generated_secret

   # Path to your Excel file on OneDrive (default is root)
   ONEDRIVE_FILE_PATH=/Release-CheckList.xlsx
   ```

3. Generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```

## Step 5: Install Dependencies and Run

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

4. Click **Sign in with Microsoft**

5. Authorize the application to access your OneDrive files

6. Your pallet data should load automatically!

## How It Works

### Authentication Flow

1. User clicks "Sign in with Microsoft"
2. User is redirected to Microsoft login
3. User grants permission to access OneDrive files
4. User is redirected back with an access token
5. The app can now read and write to the Excel file on OneDrive

### Data Synchronization

- **Read**: Data is read from OneDrive when you first load the page
- **Cache**: Data is cached in memory for performance
- **Periodic Sync**: Every 2 minutes, the app syncs with OneDrive:
  - Writes any pending changes to OneDrive
  - Reads the latest data from OneDrive
- **Manual Sync**: Click "Sync Now" to force an immediate sync
- **Updates**: When you mark a pallet as complete, it's cached locally and written to OneDrive during the next sync

### File Structure

The app expects an Excel file with a sheet named `PalletTracker` with these columns:

| Column | Description |
|--------|-------------|
| Job Number | Job identifier |
| Release Number | Release identifier |
| Pallet Number | Pallet number |
| Size | Pallet size |
| Elevation | Elevation information |
| Made | "X" for completed, empty for pending |
| Acc List | Accessories list |
| Shipped Date | Shipping date |
| Notes | Additional notes |

## Troubleshooting

### "Not authenticated" Error

- Make sure you're signed in with Microsoft
- Check that your Azure AD credentials are correct in `.env.local`
- Try signing out and signing back in

### "File not found" Error

- Verify the file exists on OneDrive
- Check that `ONEDRIVE_FILE_PATH` matches the actual file path
- Make sure the file is in the root folder (or update the path)

### "Sheet not found" Error

- Open the Excel file and verify there's a sheet named `PalletTracker`
- Check that the sheet name is spelled exactly as shown (case-sensitive)

### Permission Denied Errors

- Go back to Azure Portal and verify API permissions are granted
- Make sure you added `Files.ReadWrite.All` permission
- Try granting admin consent for the permissions

### Access Token Expired

- The app automatically refreshes tokens
- If it fails, try signing out and signing back in

## Production Deployment

### For Production (e.g., Vercel):

1. Update redirect URI in Azure:
   - Add: `https://your-domain.com/api/auth/callback/azure-ad`

2. Update environment variables:
   ```env
   NEXTAUTH_URL=https://your-domain.com
   AZURE_AD_TENANT_ID=common
   ```

3. Add environment variables to your hosting platform

4. Deploy the application

## Security Notes

- **Never commit** `.env.local` to version control
- Keep your client secret safe and rotate it periodically
- Use HTTPS in production
- Consider limiting API permissions to the minimum required
- Review who has access to the Excel file on OneDrive

## Alternative File Paths

If your Excel file is in a subfolder:

```env
# File in "Documents" folder
ONEDRIVE_FILE_PATH=/Documents/Release-CheckList.xlsx

# File in nested folders
ONEDRIVE_FILE_PATH=/Work/Projects/Release-CheckList.xlsx
```

## Support

For issues or questions:
- Check the Azure Portal for configuration errors
- Review the browser console for error messages
- Check server logs for authentication issues
