# Django Backend for SDPO Dashboard

## Setup Instructions

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Linux/Mac
   # or
   venv\Scripts\activate     # On Windows
   ```

2. Install dependencies:
   ```bash
   pip install django djangorestframework psycopg2-binary celery redis django-cors-headers
   ```

3. Create Django project:
   ```bash
   django-admin startproject sdpo_backend .
   ```

4. Create apps:
   ```bash
   python manage.py startapp authentication
   python manage.py startapp dashboard
   python manage.py startapp analytics
   ```

## API Endpoints (Planned)

- `/api/auth/` - Authentication and authorization
- `/api/sdpos/` - SDPO management and listing
- `/api/metrics/` - Performance metrics with filtering
- `/api/crime/` - Crime data and analytics
- `/api/activities/` - Field activities and uploads
- `/api/reports/` - QPR and custom report generation
- `/api/geospatial/` - Map data and boundaries

## Database Models (Planned)

- User Management (Officers, Roles, Permissions)
- Jurisdictional Hierarchy (Ranges, Districts, SDPOs)
- Performance Metrics (KPIs, Targets, Achievements)
- Crime Data (FIRs, Cases, Investigations)
- Field Activities (Inspections, Patrols, Community Events)
- Media Management (Photos, Videos, Documents)
