# PV Archiving and Management System — Project Documentation

**Generated on:** May 8, 2026  
**Current Progress:** 55% Complete

---

## 1. Project Summary

**PV Archiving and Management System** is a digitization platform for academic documents called `PV` used by an educational institute.

It manages three PV types:

- `PV_FF` — PV Fin de Formation
- `PV_CC` — PV Contrôles Continus
- `PV_EFM` — PV Examens de Fin de Module

It supports:

- Document lifecycle tracking
- PDF/image upload
- Role-based access
- Search and export
- Activity logging
- Admin user management

---

## 2. Architecture

**Frontend**

- React SPA built with Vite
- Tailwind CSS UI
- Axios-based API client in `Frontend/src/services/api.js`
- Pages managed in `Frontend/src/App.jsx`
- Role-aware sidebar navigation

**Backend**

- Laravel 12 API
- Sanctum authentication
- Routes defined in `Backend/routes/api.php`
- Controllers in `Backend/app/Http/Controllers/Api`
- Models in `Backend/app/Models`
- Middleware alias `role` registered in `Backend/bootstrap/app.php`

**Database**

- MySQL assumed
- Laravel migrations define schema

---

## 3. Existing Features

### Backend
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/pv-documents`
- `POST /api/pv-documents`
- `GET /api/pv-documents/{id}`
- `PATCH /api/pv-documents/{id}`
- `PATCH /api/pv-documents/{id}/status`
- `DELETE /api/pv-documents/{id}`
- `POST /api/pv-documents/{id}/files`
- `GET /api/pv-files/{id}/download`
- `DELETE /api/pv-files/{id}`

### Backend business logic
- PV type validation for `PV_FF`, `PV_CC`, `PV_EFM`
- Parent-child PV relationships via `pv_ff_id`
- Document lifecycle statuses
- Soft delete on `pv_documents`
- Activity logging for auth and PV actions
- Role middleware available

### Frontend
- Login UI with auth flow
- Main app shell and navigation
- Dashboard page placeholder
- Documents list UI
- Add PV dynamic form UI
- PV detail UI
- User management UI
- Activity log UI
- Settings page placeholder

---

## 4. Remaining Features

### Backend missing/partial
- Search endpoint is commented out
- Activity log route is commented out
- User management API absent
- Export APIs absent
- No explicit role protection on PV routes
- No dedicated search / export / user / settings controllers beyond placeholders

### Frontend missing/partial
- Actual API integration for PV list, create, update, delete
- Add PV form uses mock data and no real upload
- File upload UI not wired to backend
- Detail page actions are UI-only
- Search page not implemented functionally
- User management page not connected to API
- Export UI not built
- Dashboard content not wired

---

## 5. Database Structure

### `users`
- `id`
- `name`
- `email`
- `password`
- `role` enum: `admin`, `gestionnaire`, `archiviste`, `consultant`
- `is_active`
- `remember_token`
- timestamps

### `pv_documents`
- `id`
- `type` enum: `PV_FF`, `PV_CC`, `PV_EFM`
- `status` enum: `BROUILLON`, `EN_ATTENTE`, `VALIDE_PAPIER`, `ARCHIVE_NUMERIQUE`, `ARCHIVE_COMPLET`
- `academic_year`
- `niveau`
- `filiere`
- `groupe`
- `pv_ff_id`
- `semester`
- `module`
- `session`
- `physical_location`
- `notes`
- `created_by`
- `validated_by`
- `validated_at`
- timestamps
- `deleted_at`

### `pv_files`
- `id`
- `pv_document_id`
- `original_name`
- `stored_name`
- `file_path`
- `file_type`
- `file_size`
- `uploaded_by`
- timestamps

### `activity_logs`
- `id`
- `user_id`
- `action` enum
- `target_type`
- `target_id`
- `target_label`
- `meta`
- `ip_address`
- `created_at`

---

## 6. Frontend Structure

Key frontend files:

- `Frontend/src/App.jsx`
- `Frontend/src/services/api.js`
- `Frontend/src/components/Navigation.jsx`
- `Frontend/src/components/Login.jsx`
- `Frontend/src/components/AddPV.jsx`
- `Frontend/src/components/DocumentsList.jsx`
- `Frontend/src/components/PvDetail.jsx`
- `Frontend/src/components/UserManagement.jsx`

Frontend status:
- UI layouts are mostly built
- Many pages are placeholders or use mock data
- Navigation and auth storage exist
- API calls are only implemented for login/logout

---

## 7. Backend Structure

Key backend files:

- `Backend/routes/api.php`
- `Backend/app/Http/Controllers/Api/AuthController.php`
- `Backend/app/Http/Controllers/Api/PvDocumentController.php`
- `Backend/app/Http/Controllers/Api/PvFileController.php`
- `Backend/app/Http/Controllers/Api/ActivityLogController.php`
- `Backend/app/Models/User.php`
- `Backend/app/Models/PvDocument.php`
- `Backend/app/Models/PvFile.php`
- `Backend/app/Models/ActivityLog.php`
- `Backend/database/migrations/*`

Backend status:
- Core PV API is implemented
- Auth and activity logging exist
- Some planned routes are commented or missing

---

## 8. Authentication & Roles Status

### Implemented
- Sanctum auth exists
- Login/logout/me endpoints exist
- Frontend stores token and user
- Role-based sidebar menu for `admin`
- Role middleware alias `role` available

### Gaps
- Not all back-end routes use role middleware
- Frontend does not yet restrict actions by role during API calls
- No user management API for admin to manage roles/accounts
- Session restore currently only from localStorage, no auto-refresh using `/auth/me`

---

## 9. Missing APIs

- `GET /api/pv-documents/search`
- `GET /api/activity-logs`
- `GET /api/activity-logs/stats`
- `API user management` (`users` resource)
- `Export` endpoints for PDF / Excel / CSV
- `PUT/PATCH /api/users/{id}` / `DELETE /api/users/{id}`
- `GET /api/pv-documents/{id}/children` or parent-child helper endpoint if needed
- File association or paper/digital link endpoints beyond upload/download

---

## 10. Current Progress Percentage

Estimated completion: **55%**

Breakdown:
- Backend core is about **65% complete** (auth, PV CRUD, file storage, logging)
- Frontend UI is about **45% complete** (pages exist, but most are not connected to backend)
- Remaining work is mainly integration, search/export, role-based controls, and admin flows

---

## 11. Suggested Development Roadmap

### Phase 0: Setup
Goal: Get both apps running locally
Tasks:
- Install backend dependencies
- Install frontend dependencies
- Configure `.env`
- Run Laravel server and Vite
Status: `Completed` / `Needs verification`

### Phase 1: Authentication & Roles
Goal: Harden auth and role flow
Tasks:
- Verify Sanctum login/logout
- Fix session restore using `/auth/me`
- Apply role middleware to protected routes
- Add frontend role gating for actions
Status: `In progress`

### Phase 2: PV-FF Management
Goal: Full PV-FF create / list / detail / edit
Tasks:
- Connect `AddPV` form to API
- Load PV documents list from backend
- Show PV-FF metadata in detail view
- Support PV-FF update and delete
Status: `In progress`

### Phase 3: PV-CC / PV-EFM Support
Goal: Complete child PV workflows
Tasks:
- Ensure backend child validation and parent linking
- Wire `PV_CC` and `PV_EFM` forms
- Support listing child docs and parent context
Status: `In progress`

### Phase 4: File Upload & Association
Goal: Attach digital scans to PVs
Tasks:
- Implement frontend drag/drop file upload
- Show uploaded files in PV detail
- Support download and delete
- Ensure files saved to private storage
Status: `In progress`

### Phase 5: Search & Filters
Goal: Fast document retrieval
Tasks:
- Implement backend search route
- Build advanced search page
- Add filters by type, status, academic year, module, etc.
Status: `Missing`

### Phase 6: Activity Log & Dashboard
Goal: Audit trail + analytics
Tasks:
- Wire `ActivityLogController` route
- Display activity logs page
- Build dashboard stats from logs and PV counts
Status: `Missing`

### Phase 7: Export & Reporting
Goal: Export and reporting features
Tasks:
- Add PDF / Excel / CSV export endpoints
- Implement export UI and action buttons
- Support export by filter/search
Status: `Missing`

### Phase 8: User Management & Settings
Goal: Admin controls
Tasks:
- Add backend `UserController`
- Implement frontend user CRUD
- Support role assignment and activation
- Add settings page for app configuration
Status: `Missing`

### Phase 9: Polish, QA, Deployment
Goal: Complete QA and deploy
Tasks:
- Fix UX and error states
- Add validation messages
- Ensure responsive layout
- Run integration tests
- Prepare deployment steps
Status: `Missing`

---
