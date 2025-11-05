# Stay Hard - AI Coding Agent Instructions

## Project Overview
**Stay Hard** is a React + TypeScript habit tracker application for completing personal challenges (21, 45, 60, or 75 days) with three difficulty levels (Soft, Hard, Custom). Users authenticate via Firebase, track daily tasks, and monitor progress through a visual grid.

**Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS 4, Firebase Auth, Backend REST API

## Architecture Patterns

### State Management: Optimistic UI with Server Sync
The app uses a **3-step optimistic update pattern** throughout (see `useAppState.ts`):
1. **Optimistic UI Update** - Immediately update local state
2. **API Write** - Send request to backend
3. **Server Sync** - Update state with server response OR rollback on error

**Example** (`handleTaskToggle` in `useAppState.ts`):
```typescript
// 1. Optimistic update
setState(prev => ({ ...prev, tasks: updatedTasks }));
// 2. API call
const result = await progressService.updateTaskStatus(progressId, id, completed);
// 3. Sync or rollback
if (result) { setState(serverData); } else { rollback(); }
```

**Critical**: All task operations (add, delete, edit, toggle) must follow this pattern to prevent state desync.

### Custom Hook for App State
All challenge-related state and handlers live in `useAppState.ts` (not `App.tsx`). Authentication state (`user`, `isLoading`) remains in `App.tsx` because it gates the entire app.

**State Location Rules**:
- `useAppState`: Challenge settings (days, level), daily progress, tasks, photos, and all their handlers
- `App.tsx`: User authentication, login/logout, and `onAuthStateChanged` listener

### Service Layer Architecture
Services encapsulate all backend communication:
- **`progressService`**: Daily task CRUD, progress tracking, completion rates
- **`challengeService`**: Challenge settings (days, difficulty, reset)
- **`authService`**: Firebase authentication, user verification, profile management
- **`apiClient`** (`utils/api.ts`): Centralized fetch wrapper with automatic Firebase token injection

**Important**: Use `apiClient` for all API calls. It automatically adds `Authorization: Bearer <token>` headers.

### Type System
All domain objects have dedicated type files in `src/types/`:
- `Task`: Individual task with `id`, `text`, `completed`, optional `completedAt`
- `DayProgress`: Daily progress with `date`, `completionRate`, `tasks[]`, and `progressId` (backend ID)
- `User`: Full user profile with `firebaseUid` and `currentChallengeId`
- `AppState`: Top-level state container

**Critical Field**: `DayProgress.progressId` is the MongoDB document ID - required for all task mutations.

## Key Workflows

### Development
```powershell
npm run dev          # Start Vite dev server (default: http://localhost:5173)
npm run build        # TypeScript check + production build
npm run lint         # ESLint validation
```

### Backend API Connection
API URL is resolved via `utils/config.ts` with fallback chain:
1. `import.meta.env.REACT_APP_API_URL` (CRA-style)
2. `import.meta.env.VITE_API_URL` (Vite env)
3. `globalThis.__APP_API_URL` (runtime override)
4. Fallback: `http://localhost:5000/api`

**To change API URL**: Create `.env` with `VITE_API_URL=your-url` or set `__APP_API_URL` globally.

### Task State Initialization
On app load, `useAppState` runs two critical effects:
1. **Today's Tasks**: Calls `initializeDailyProgress(today)` to fetch/create today's progress entry
2. **Challenge History**: Calls `loadAllProgressForChallenge()` to populate the progress grid

**Never** manually set `dailyProgress[date].tasks` without syncing with the backend.

## Critical Conventions

### Date Format
**Always** use `YYYY-MM-DD` string format via `getTodayDate()` or `formatDate()` from `utils/utils.ts`. Never use `Date` objects as dictionary keys.

### Task IDs
- Default tasks: `task-0`, `task-1`, etc.
- Custom tasks: `task-${Date.now()}` for client-side creation
- After server sync, use the backend-provided ID

### Difficulty Levels
- **Soft**: 5 predefined tasks (healthy eating, 45min exercise, water, reading, mindfulness)
- **Hard**: 6 strict tasks (no alcohol, 2 workouts, gallon of water, progress photos)
- **Custom**: User-defined tasks (add/edit/delete enabled)

**UI Rules**: 
- Only show task add/edit/delete buttons when `level === 'Custom'`
- Changing level resets today's tasks to defaults (except Custom preserves current tasks)

### Firebase Security
- Firebase config is committed (public keys are safe)
- Never log `idToken` values
- All API calls use Firebase ID tokens via `apiClient.getAuthHeaders()`

## Component Patterns

### Props Drilling
Components receive handlers via props (no context/redux):
```tsx
<TodoList 
  tasks={todayTasks}
  onTaskToggle={handleTaskToggle}
  onTaskAdd={handleTaskAdd}
  canCustomize={state.level === 'Custom'}
/>
```

### Tailwind Styling
- Use Tailwind v4 utility classes (installed via `@tailwindcss/vite`)
- Color scheme: `amber-*`, `orange-*` for primary UI, `green-*` for completed states
- Responsive: `md:`, `lg:` breakpoints for multi-column layouts

### Lucide Icons
Import icons from `lucide-react`: `Check`, `Plus`, `Trash2`, etc.

## Common Pitfalls

1. **Missing `progressId`**: Task mutations fail if `DayProgress.progressId` is undefined. Always check before calling `progressService` methods.

2. **State Desync**: Forgetting step 3 (server sync) in optimistic updates causes UI to diverge from backend. Always update state with server response.

3. **Date Key Issues**: Using `Date` objects instead of `YYYY-MM-DD` strings breaks `dailyProgress` dictionary lookups.

4. **Stale Closures**: In `useAppState`, ensure dependencies in `useCallback` include `state.dailyProgress` or use functional `setState(prev => ...)` updates.

5. **TypeScript Strictness**: `tsconfig.app.json` has `strict: true` and `noUnusedLocals: true`. Clean up unused variables immediately.

## Backend API Reference (Quick)
- `GET /progress?userId={}&challengeId={}&date={}` - Fetch/create daily progress
- `GET /progress/challenge/:challengeId` - Get all progress for challenge
- `PATCH /progress/:progressId/tasks/:taskId` - Update task completion
- `POST /progress/:progressId/tasks` - Add custom task
- `PATCH /challenges/:challengeId/difficulty` - Change difficulty level
- `POST /challenges/:challengeId/reset` - Reset all progress

All endpoints require `Authorization: Bearer <firebase-token>` header (handled by `apiClient`).

## Files to Reference
- **State Management**: `src/hooks/useAppState.ts` (700+ lines, core logic)
- **Service Layer**: `src/services/*.ts` (API boundaries)
- **Type Definitions**: `src/types/*.ts` (contract definitions)
- **Utilities**: `src/utils/utils.ts` (date formatting, default tasks, completion colors)
- **Main Component**: `src/App.tsx` (authentication + render logic)
