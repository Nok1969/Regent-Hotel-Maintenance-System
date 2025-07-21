# Regent Cha-am Hotel Maintenance System Configuration

## Project Details
- **Hotel Name**: Regent Cha-am Hotel
- **System Name**: Regent-Cha-am Hotel Maintenance System
- **Color Theme**: Blue (#2563eb, #1d4ed8, #1e40af)
- **Domain**: regent-cha-am-hotel-maintenance-system

## Configuration Changes Required

### 1. Translation Files (client/src/locales/)

#### English (en.json):
```json
{
  "hotel": {
    "name": "Regent Cha-am Hotel",
    "subtitle": "Maintenance Management System",
    "description": "Professional maintenance request system for Regent Cha-am Hotel staff"
  }
}
```

#### Thai (th.json):
```json
{
  "hotel": {
    "name": "โรงแรมรีเจนท์ ชะอำ",
    "subtitle": "ระบบจัดการซ่อมบำรุง", 
    "description": "ระบบแจ้งซ่อมมืออาชีพสำหรับพนักงานโรงแรมรีเจนท์ ชะอำ"
  }
}
```

### 2. Color Theme (client/src/index.css):
```css
:root {
  --primary: 219 85% 58%; /* Blue #2563eb */
  --primary-foreground: 0 0% 100%;
  --secondary: 220 85% 55%; /* Darker blue #1d4ed8 */
  --accent: 221 83% 53%; /* Deep blue #1e40af */
}
```

### 3. Components to Update:
- Landing.tsx - Hotel name and branding
- HotelLogo.tsx - Logo text and colors
- All translation keys referencing hotel name

### 4. Package.json:
```json
{
  "name": "regent-cha-am-hotel-maintenance-system",
  "description": "Maintenance management system for Regent Cha-am Hotel"
}
```