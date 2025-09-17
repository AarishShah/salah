# Mosque Prayer Timing System - Comprehensive Project Summary

## Overview

A multi-layered prayer timing management system that transforms official prayer times into mosque-specific schedules, handling complex requirements like different sects, time adjustments, and year transitions.

## User Roles & Permissions

### 1. **Users** (Default role)

- Sign up via Google OAuth
- View mosque locations and prayer times
- Search mosques by location/name
- Request to become editors
- Permissions: `timing:read`

### 2. **Editors**

- Upgraded users who manage assigned mosques
- Configure mosque-specific prayer adjustments
- Generate and approve prayer schedules
- Can only edit their assigned mosques
- Permissions: `timing:read`, `timing:edit`, `config:edit`

### 3. **Admins**

- Manage all users and editor requests
- Create and delete mosques
- Upload official prayer time data (CSV)
- Assign mosques to editors
- Permissions: All editor permissions + `editor:manage`, `user:manage`

### 4. **Super Admin** (To be implemented)

- System-wide control
- Manage admin accounts
- Override any restrictions

## Architecture: Three-Layer System

### Layer 1: Official Meeqat (Foundation Layer)

**Purpose**: Store authoritative prayer times from religious organizations

**Key Features**:

- 366 days of prayer times (handles leap years)
- Location and sect-specific (Sunni/Shia with sub-schools)
- Year-independent format (e.g., "1-Jan", dayNumber 1-366)
- Times stored as minutes from midnight (0-1439)
  - **Why 0-1439?** Simplifies calculations:
    - Easy addition/subtraction for delays
    - No date/timezone complexity
    - Simple validation (must be < 1440)
    - Example: 5:30 AM = 330 minutes, 6:45 PM = 1125 minutes

**Data Structure**:

```javascript
{
  locationName: "City Name",
  sect: "sunni",
  schoolOfThought: "hanafi",
  timings: [
    { date_csv: "1-Jan", dayNumber: 1, fajr: 330, dhuhr: 745, ... },
    // ... 366 days
  ]
}
```

### Layer 2: Mosque Meeqat (Customization Layer)

**Purpose**: Apply mosque-specific adjustments to official times

**Generated From**: Official Meeqat + Meeqat Config

**Key Features**:

- 366 days of mosque-specific timings
- Includes both prayer times and adhan times
- Tracks manual edits per day
- Stores configuration snapshot used
- Requires editor approval
- Version tracking

**Adjustments Applied**:

1. **Delays**: Add/subtract minutes (-120 to +120)
2. **Fixed Times**: Override with specific time
3. **Rounding**: Round to nearest 5/10/15 minutes
4. **Adhan Gap**: Time between call to prayer and congregation

**Manual Editing**:

- Editors can adjust specific days after generation
- System tracks who edited, when, and why
- Preserves audit trail

### MeeqatConfig (Rules Engine)

**Purpose**: Store mosque-specific adjustment rules

**Configuration per Prayer**:

- `delay`: Minutes to add/subtract from official time
- `fixedTime`: Override with specific time (optional)
- `adhanGap`: Minutes between adhan and jamaat
- `roundingInterval`: 0, 5, 10, 15

**Configuration per Jummah**:

- `khutbahStartTime`: Time of khutbah (optional)
- `jamaatTime`: Time of jamaat

**Data Structure**:

```javascript
{
  mosqueId: "mosque123",
  fajr: { delay: -5, fixedTime: null, adhanGap: 10, roundingInterval: 5 },
  dhuhr: { delay: 0, fixedTime: null, adhanGap: 15, roundingInterval: 10 },
  // ... other prayers
  jummah: { khutbahStartTime: "12:30", jamaatTime: "13:00" }
}
```

### Layer 3: Mosque Schedule (Presentation Layer) - To Be Implemented

**Purpose**: Year-specific, fast-fetching prayer calendar for end users

**Key Features**:

- Generated from approved Mosque Meeqat
- Year-specific with actual dates (e.g., "2024-01-01")
- ISO format timestamps for easy frontend consumption
- Pre-calculated 12h/24h formats
- Optimized for common queries:
  - Today's schedule
  - Weekly/monthly views
  - Date range queries

**Why Separate from Mosque Meeqat?**:

- **Performance**: No conversion needed at runtime
- **Storage**: ISO dates enable efficient database indexing
- **Flexibility**: Can generate multiple years from same Mosque Meeqat
- **Frontend-friendly**: Direct JSON response, no processing needed

**Example Structure** (proposed):

```javascript
{
  mosque: ObjectId,
  year: 2024,
  schedules: [
    {
      date: "2024-01-01",
      dayOfWeek: "Monday",
      prayers: {
        fajr: {
          adhan: "2024-01-01T05:20:00",
          jamaat: "2024-01-01T05:30:00",
          adhan12h: "5:20 AM",
          jamaat12h: "5:30 AM"
        },
        // ... other prayers
      },
      isJummah: false
    }
  ]
}
```

## Authentication Middleware Deep Dive

### Core Auth Middleware Structure

The authentication system uses JWT tokens with flexible role and permission checking:

```javascript
const Auth = (options = {}) => {
  // Options can include:
  // - allowedRoles: ['user', 'editor', 'admin']
  // - requiredRole: 'editor' (minimum role)
  // - requiredPermission: 'timing:edit'
  // - checkMosqueAccess: true
};
```

### Middleware Checks (in order):

1. **Token Extraction & Validation**

   - Extracts Bearer token from Authorization header
   - Verifies JWT signature and expiry
   - Returns 401 if missing/invalid

2. **User Verification**

   - Loads user from database
   - Checks if user exists (404 if not)
   - Verifies account status:
     - `isActive`: Must be true
     - `isBlocked`: Must be false
   - Returns 403 if account inactive/blocked

3. **Role-Based Access Control**

   - **allowedRoles**: Checks if user's role is in allowed list
   - **requiredRole**: Implements role hierarchy
     - Hierarchy: user (0) < editor (1) < admin (2)
     - Higher roles inherit lower role permissions
   - Returns 403 if insufficient role

4. **Permission Checking**

   - Virtual property generates permissions based on role:
     - **User**: `['timing:read']`
     - **Editor**: `['timing:read', 'timing:edit', 'config:edit']`
     - **Admin**: All editor permissions + `['editor:manage', 'user:manage']`
   - Checks specific permission if required
   - Returns 403 if missing permission

5. **Mosque Access Control** (for Editors)

   - Only applies when `checkMosqueAccess: true`
   - Extracts mosqueId from params or body
   - For editors: Checks if mosque is in `assignedMosques`
   - For admins: Always allowed (bypass check)
   - Returns 403 if editor lacks access

6. **Request Enhancement**
   - Attaches user object to `req.user`:
     ```javascript
     req.user = {
       userId: ObjectId,
       email: string,
       phone: string(optional),
       name: string,
       role: string,
       assignedMosques: [ObjectId],
     };
     ```

### Middleware Usage Examples

```javascript
// Any authenticated user
const userAuth = Auth({ allowedRoles: ["user", "editor", "admin"] });

// Editors and admins only
const editorAuth = Auth({ allowedRoles: ["editor", "admin"] });

// Admins only
const adminAuth = Auth({ allowedRoles: ["admin"] });

// Editor with mosque access check
const editorWithAccess = Auth({
  allowedRoles: ["editor", "admin"],
  checkMosqueAccess: true,
});

// Specific permission required
const configEditor = Auth({
  requiredPermission: "config:edit",
});
```

## Error Response Format

All errors follow consistent format:

```javascript
{
  status: 'failed',
  message: 'Human readable error message',
  code: 404 // Optional HTTP status code
}
```

## Success Response Format

```javascript
{
  status: 'success',
  data: {}, // Optional data object
  message: 'Operation successful' // Optional message
}
```

## Complete Application Flow

### 1. User Registration Flow

```
User visits app → Clicks "Sign in with Google"
→ Google OAuth flow
→ System creates user account:
  - Role: 'user' (default)
  - isActive: true
  - Stores: googleId, email, name, profilePicture
→ JWT token issued
→ User can view mosques and prayer times
```

### 2. Editor Request Flow

```
User wants to manage mosque
→ POST /user/editor-request
→ Admin sees request in dashboard
→ Admin approves/rejects request
→ If approved:
  - User role → 'editor'
  - Mosques assigned to editor
→ Editor can now access mosque management
```

### 3. Prayer Time Setup Flow (Full Cycle)

```
Step 1: Admin uploads CSV
→ POST /official-meeqat (with CSV file)
→ Creates 366-day official timing template
→ Stored with location, sect, school

Step 2: Admin creates mosque
→ POST /mosque
→ Mosque created (inactive)
→ Editor assigned to mosque

Step 3: Editor configures mosque
→ Select official meeqat (GET /official-meeqat)
→ PATCH /mosque/:id/official-meeqat
→ Create config (POST /meeqat-config/create/:mosqueId)
  - Set delays, fixed times, rounding

Step 4: Generate mosque-specific timings
→ POST /mosque-meeqat/generate/:mosqueId
→ System applies config to official times
→ Creates 366-day mosque template
→ Editor reviews (GET /mosque-meeqat/:mosqueId)

Step 5: Editor adjusts if needed
→ PATCH /mosque-meeqat/:mosqueId
→ Can edit specific days with reason
→ System tracks edits

Step 6: Editor approves
→ PATCH /mosque-meeqat/approve/:mosqueId
→ Mosque becomes active
→ Ready for schedule generation

Step 7: Generate yearly schedule (future)
→ POST /mosque-schedule/generate
→ Maps 366-day template to specific year
→ Handles Fridays and leap years
→ Users can view schedules
```

## Key Design Decisions Explained

### 1. Why Three Layers?

- **Separation of Concerns**: Each layer has specific responsibility
- **Reusability**: Generate multiple years from one template
- **Flexibility**: Update at any layer without affecting others
- **Performance**: Pre-calculated values for fast retrieval

### 2. Why Minutes from Midnight (0-1439)?

- **Calculation Simplicity**:
  - Adding delay: `newTime = baseTime + delay`
  - No date math or timezone issues
- **Validation**: Simple range check (0-1439)
- **Storage Efficiency**: Integer vs complex date objects
- **Consistency**: Same format across all layers

### 3. Why Year-Independent Templates?

- **Friday Problem**: Jan 1 could be any day of the week
- **Reusability**: One template works for multiple years
- **Consistency**: Same prayer patterns regardless of year
- **Leap Year Handling**: 366 days covers all cases

### 4. Why Configuration Snapshots?

- **Audit Trail**: Know exactly what rules generated timings
- **Reproducibility**: Can recreate exact timings later
- **Change Management**: Compare old vs new configurations
- **Debugging**: Trace issues back to specific config

## API Endpoint Summary

### Authentication Endpoints

```
POST   /auth/google-login     - Google OAuth login
POST   /auth/refresh-token    - Refresh JWT token
POST   /auth/logout           - Logout (clear refresh tokens)
```

### User Endpoints

```
GET    /user/profile          - Get own profile
PUT    /user/profile          - Update profile
DELETE /user/account          - Delete account
POST   /user/editor-request   - Request editor role
GET    /user/editor-request/status - Check request status
PATCH  /user/phone-verification - Verify phone number
```

### Admin Endpoints

```
GET    /admin/all             - List all users
GET    /admin/stats           - User statistics
GET    /admin/editors         - List all editors
GET    /admin/editor-requests - View editor requests
PUT    /admin/editor-requests/:id - Approve/reject request
GET    /admin/:userId         - Get specific user
PUT    /admin/:userId/role    - Update user role
PUT    /admin/:userId/status  - Update user status
PUT    /admin/:userId/mosques - Assign mosques to editor
```

### Editor Endpoints

```
GET    /editor/assigned-mosques - Get assigned mosques
```

### Mosque Endpoints

```
GET    /mosque/map/nearby     - Find nearby mosques
GET    /mosque/search         - Search mosques
GET    /mosque/:id            - Get mosque details
PATCH  /mosque/:id/official-meeqat - Set official meeqat (editor)
POST   /mosque                - Create mosque (admin)
DELETE /mosque/:id            - Soft delete mosque (admin)
```

### Official Meeqat Endpoints

```
GET    /official-meeqat       - List all (editor)
GET    /official-meeqat/:id   - Get specific
POST   /official-meeqat       - Upload CSV (admin)
PUT    /official-meeqat/:id   - Update CSV (admin)
```

### Meeqat Config Endpoints

```
GET    /meeqat-config/:mosqueId - Get config
POST   /meeqat-config/create/:mosqueId - Create config
PATCH  /meeqat-config/:mosqueId - Update config
DELETE /meeqat-config/:mosqueId - Delete config
```

### Mosque Meeqat Endpoints

```
GET    /mosque-meeqat/:mosqueId - Get timings
GET    /mosque-meeqat/:mosqueId/download-html - Download HTML
POST   /mosque-meeqat/generate/:mosqueId - Generate timings
PATCH  /mosque-meeqat/approve/:mosqueId - Approve timings
PATCH  /mosque-meeqat/:mosqueId - Edit specific days
DELETE /mosque-meeqat/:mosqueId - Delete timings
```

### Mosque Schedule Endpoints (To Be Implemented)

```
GET    /mosque-schedule/:mosqueId/today - Today's schedule
GET    /mosque-schedule/:mosqueId/:year - Full year schedule
GET    /mosque-schedule/:mosqueId/range - Date range
POST   /mosque-schedule/generate - Generate for year
```

## Technical Stack & Patterns

### Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```bash
# Server Configuration
PORT=9040
NODE_ENV=development

# Database Configuration
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_CLUSTER_URL=your_cluster_url
DB_NAME=your_db_name

# Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id

# External APIs
MAPBOX_API_KEY=your_mapbox_api_key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Timezone Configuration for Cron Jobs
# Use 'Asia/Kolkata' for IST, 'UTC' for UTC, etc.
# This affects when scheduled notifications and cleanup tasks run
TIMEZONE=Asia/Kolkata
```

### Backend Architecture

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Google OAuth
- **File Upload**: Multer
- **Rate Limiting**: Custom rate limiter for uploads
- **Error Handling**: Centralized with catchError utility
- **Scheduling**: Node-cron for automated tasks with configurable timezone

### Design Patterns Used

1. **MVC Pattern**

   - **Models**: Mongoose schemas with business logic
   - **Controllers**: Handle HTTP requests/responses
   - **Services**: Business logic layer
   - **Routes**: Clean endpoint definitions

2. **Middleware Pattern**

   - Authentication checks
   - Role-based access control
   - Mosque access verification
   - Error handling

3. **Repository Pattern** (implicit)
   - Models encapsulate database operations
   - Services handle business logic
   - Controllers handle HTTP concerns

### Code Organization

```
project/
├── models/
│   ├── user.model.js
│   ├── mosque.model.js
│   ├── officialMeeqat.model.js
│   ├── meeqatConfig.model.js
│   └── mosqueMeeqat.model.js
├── controllers/
│   ├── user.controller.js
│   ├── admin.controller.js
│   ├── mosque.controller.js
│   └── ...
├── services/
│   ├── user.service.js
│   ├── admin.service.js
│   └── ...
├── routes/
│   ├── user.routes.js
│   ├── admin.routes.js
│   └── ...
├── middleware/
│   └── auth.middleware.js
└── utils/
    ├── catchError.js
    ├── upload.js
    └── rateLimiter.js
```

## Future Enhancements & Considerations

### 1. Super Admin Implementation

- **Purpose**: System-wide control and oversight
- **Permissions**:
  - Manage admin accounts
  - Override any restrictions
  - System configuration
  - Backup/restore operations
- **Implementation**: Add 'superadmin' role with highest hierarchy

### 2. Admin Privilege Revision

- **Current**: Full access to all operations
- **Proposed Changes**:
  - Limit mosque deletion to super admin
  - Add approval workflow for critical changes
  - Implement audit logging for admin actions
  - Region-based admin restrictions

### 3. Mosque Schedule Implementation

```javascript
// Proposed schema structure
const mosqueScheduleSchema = {
  mosque: ObjectId,
  year: Number,
  timezone: String, // e.g., "Asia/Karachi"
  schedules: [
    {
      date: Date, // ISO format
      hijriDate: String, // Islamic calendar
      prayers: {
        fajr: {
          adhan: { iso: Date, time12h: String, time24h: String },
          jamaat: { iso: Date, time12h: String, time24h: String },
        },
        // ... other prayers
      },
      isJummah: Boolean,
      specialEvents: [String], // Eid, Ramadan, etc.
    },
  ],
};
```

### 4. Additional Features to Consider

- **Notification System**: Prayer time reminders
- **Multi-language Support**: Beyond English/Urdu
- **Historical Data**: Track timing changes over years
- **API Rate Limiting**: Prevent abuse
- **Backup System**: Automated data backups
- **Analytics**: Prayer attendance tracking
- **Mobile Apps**: iOS/Android applications (for user and editor)
- **Web Dashboard**: Enhanced admin/super admin dashboard

---
