# NewChecklist - Features Documentation

## Overview
NewChecklist is a modern, real-time collaborative checklist application with advanced task management, customization, and security features.

## Core Features

### 1. Task Management
- **Create Tasks**: Add new tasks with titles and optional categories
- **Task Status**: Three states - Pending (0), Completed (1), Rejected (2)
- **Delete Tasks**: Remove tasks permanently
- **Real-time Updates**: Automatic sync across devices via Supabase Realtime
- **Categories**: Organize tasks by type (Daily, Weekly, Monthly, Personal, Work, Shopping, Other)

### 2. Task Groups
- **Group Creation**: Create custom groups to organize tasks by project or context
- **Group Colors**: Visual distinction with customizable colors
- **Group Filtering**: View tasks filtered by specific groups
- **Group Management**: Edit and delete groups with ease

### 3. Task Filtering & Display
- **Status Filters**: Filter tasks by completion status (All, Pending, Completed, Rejected)
- **Category Filters**: Filter by task category
- **Group Filtering**: View tasks from specific groups
- **Statistics**: Live task count and completion percentage

### 4. Customization & Preferences
- **Theme Customization**: Change primary, secondary, and accent colors
- **Color Presets**: 5 pre-defined color themes (Ocean, Forest, Sunset, Purple, Rose)
- **Font Selection**: Choose from multiple font families
- **Border Radius**: Adjust corner rounding throughout the app
- **Dark Mode**: Toggle between light and dark themes
- **Persistent Settings**: All preferences saved to user's profile

### 5. User Experience Enhancements
- **Smooth Animations**: Fade-in, slide-in, and scale animations throughout
- **Responsive Design**: Fully mobile-friendly interface
- **Real-time Sync**: Instant task updates across all connected devices
- **Intuitive UI**: Clean, modern interface with helpful visual feedback
- **Error Messages**: Clear, user-friendly error notifications
- **Loading States**: Visual feedback during async operations

### 6. Security Features
- **Authentication**: Supabase Auth integration with email/password
- **Row Level Security (RLS)**: Database-level access control
- **Input Validation**: Sanitization of all user inputs
- **Rate Limiting**: Protection against abuse
- **Secure API**: Server-side authentication checks
- **XSS Prevention**: HTML entity escaping on all user inputs
- **Audit Logging**: Track user actions for security monitoring
- **Password Strength**: Validation rules for secure passwords

## Database Schema

### Tables

#### `public.tasks`
```sql
- id: UUID (Primary Key)
- title: TEXT (Max 500 chars)
- status: SMALLINT (0, 1, or 2)
- user_id: UUID (References auth.users)
- group_id: UUID (References groups, nullable)
- category: TEXT (Optional category)
- due_date: TIMESTAMP (Optional)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `public.groups`
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- name: TEXT (Max 50 chars)
- color: TEXT (Hex color code)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `public.user_preferences`
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users, unique)
- primary_color: TEXT
- secondary_color: TEXT
- accent_color: TEXT
- font_family: TEXT
- border_radius: INTEGER
- dark_mode: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## API Endpoints

### Groups
- `GET /api/groups` - List all user groups
- `POST /api/groups` - Create new group
- `DELETE /api/groups/[id]` - Delete group

### Preferences
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Update user preferences

### Tasks
- `PUT /api/tasks` - Update task (assign to group)

### Migrations
- `POST /api/migrations` - Run pending database migrations

## Security Considerations

### Input Validation
- All user inputs are validated before processing
- Maximum lengths enforced on all text fields
- Color validation ensures valid hex codes
- Email format validation

### Database Security
- Row Level Security (RLS) policies ensure users can only access their own data
- Service role used only for migrations
- Parameterized queries prevent SQL injection

### Rate Limiting
- API endpoints include rate limiting to prevent abuse
- Default limit: 50 requests per minute per user

### Error Handling
- Sensitive error details hidden from clients
- Generic error messages displayed to users
- All errors logged server-side for debugging

## Performance Features

### Real-time Synchronization
- Supabase Realtime for instant task updates
- Optimistic updates for better UX
- Efficient subscription management

### Caching & State Management
- React hooks for local state management
- SWR patterns for data fetching
- Memoized computations to prevent unnecessary re-renders

## Configuration

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: For migrations (server-side only)

### Default Preferences
```javascript
{
  primary_color: '#0ea5e9',
  secondary_color: '#06b6d4',
  accent_color: '#0891b2',
  font_family: 'geist',
  border_radius: 8,
  dark_mode: false
}
```

## Future Enhancement Ideas

1. **Collaboration Features**
   - Share tasks/groups with other users
   - Real-time collaboration indicators
   - Comments on tasks

2. **Advanced Filtering**
   - Priority levels
   - Tags/labels system
   - Search functionality

3. **Time Tracking**
   - Time estimation for tasks
   - Time tracking on tasks
   - Productivity analytics

4. **Mobile App**
   - Native iOS/Android apps
   - Offline sync support
   - Push notifications

5. **Integrations**
   - Calendar integration
   - Slack notifications
   - GitHub issues integration

## Troubleshooting

### Tasks Not Syncing
- Check Supabase connection in browser console
- Verify RLS policies allow your user
- Check network connection

### Preferences Not Saving
- Ensure user is authenticated
- Check API endpoints are accessible
- Browser console may show specific errors

### Rate Limiting
- If experiencing rate limit errors, wait 1 minute before retrying
- Contact support for rate limit adjustment
