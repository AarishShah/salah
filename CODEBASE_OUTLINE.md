# SALAH Codebase Outline

## Mosque Prayer Timing Management System

---

## 🏗️ **Project Overview**

**Name**: SALAH (Mosque Prayer Timing System)  
**Type**: Node.js/Express.js REST API  
**Database**: MongoDB with Mongoose ODM  
**Architecture**: MVC Pattern with Service Layer  
**Authentication**: Google OAuth + JWT  
**Documentation**: Swagger/OpenAPI

---

## 📁 **Project Structure**

### **Root Directory**

```
salah/
├── .git/                    # Git repository
├── .github/                 # GitHub workflows and templates
├── node_modules/            # Dependencies
├── src/                     # Source code
├── .gitignore              # Git ignore rules
├── Dockerfile              # Docker configuration
├── package.json            # Project metadata & dependencies
├── package-lock.json       # Locked dependency versions
├── README.md               # Project documentation
├── test.html               # Google OAuth testing page
├── time.csv                # Sample prayer time data
└── CODEBASE_OUTLINE.md     # This file
```

---

## 🏛️ **Architecture Overview**

### **Three-Layer System Design**

1. **Official Meeqat Layer** - Authoritative prayer times from religious organizations
2. **Mosque Meeqat Layer** - Mosque-specific adjustments and customizations
3. **Schedule Layer** - Final prayer schedules with events and special timings

### **MVC + Service Layer Pattern**

- **Models**: Mongoose schemas for data persistence
- **Views**: API responses (JSON)
- **Controllers**: Request/response handling
- **Services**: Business logic and data operations
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, validation, and utilities

---

## 🔧 **Core Dependencies**

### **Runtime Dependencies**

- **Express.js 5.1.0** - Web framework
- **Mongoose 8.16.1** - MongoDB ODM
- **JWT 9.0.2** - Authentication tokens
- **Google Auth Library 10.1.0** - OAuth integration
- **Helmet 8.1.0** - Security middleware
- **CORS 2.8.5** - Cross-origin resource sharing
- **Rate Limiting 7.5.1** - API protection
- **Swagger 6.2.8** - API documentation

### **Utility Libraries**

- **Moment.js 2.30.1** - Date/time manipulation
- **Date-fns 4.1.0** - Modern date utilities
- **Axios 1.10.0** - HTTP client
- **Multer 2.0.1** - File upload handling
- **CSV Parser 3.2.0** - CSV data processing

---

## 📂 **Source Code Structure (`src/`)**

### **Entry Point**

- **`app.js`** - Main application server setup

### **Database Layer**

- **`db/mongoose.js`** - MongoDB connection and configuration

### **Models (Data Schemas)**

- **`user.model.js`** - User accounts and authentication
- **`mosque.model.js`** - Mosque information and metadata
- **`officialMeeqat.model.js`** - Official prayer times (Layer 1)
- **`meeqatConfig.model.js`** - Mosque adjustment rules
- **`mosqueMeeqat.model.js`** - Customized prayer times (Layer 2)
- **`mosqueSchedule.model.js`** - Final prayer schedules (Layer 3)
- **`mosqueSpecialEvent.model.js`** - Special events and holidays
- **`editorRequest.model.js`** - Editor role requests
- **`superAdmin.model.js`** - Super administrator accounts

### **Controllers (Request Handlers)**

- **`auth.controller.js`** - Authentication and authorization
- **`user.controller.js`** - User management
- **`mosque.controller.js`** - Mosque CRUD operations
- **`officialMeeqat.controller.js** - Official timing management
- **`meeqatConfig.controller.js`** - Configuration management
- **`mosqueMeeqat.controller.js`** - Custom timing generation
- **`mosqueSchedule.controller.js`** - Schedule management
- **`mosqueSpecialEvent.controller.js`** - Event management
- **`editorRequest.controller.js`** - Editor request handling
- **`admin.controller.js`** - Administrative operations

### **Services (Business Logic)**

- **`auth.service.js`** - Authentication business logic
- **`user.service.js`** - User operations
- **`mosque.service.js`** - Mosque business logic
- **`officialMeeqat.service.js`** - Official timing operations
- **`meeqatConfig.service.js`** - Configuration processing
- **`mosqueMeeqat.service.js`** - Custom timing generation
- **`mosqueSchedule.service.js`** - Schedule operations
- **`mosqueSpecialEvent.service.js`** - Event management
- **`editorRequest.service.js`** - Request processing
- **`admin.service.js`** - Administrative services

### **Routes (API Endpoints)**

- **`index.routes.js`** - Main router and route aggregation
- **`auth.routes.js`** - Authentication endpoints
- **`user.routes.js`** - User management endpoints
- **`mosque.routes.js`** - Mosque endpoints
- **`officialMeeqat.routes.js`** - Official timing endpoints
- **`meeqatConfig.routes.js`** - Configuration endpoints
- **`mosqueMeeqat.routes.js`** - Custom timing endpoints
- **`mosqueSchedule.routes.js`** - Schedule endpoints
- **`mosqueSpecialEvent.routes.js`** - Event endpoints
- **`editorRequest.routes.js`** - Editor request endpoints
- **`admin.routes.js`** - Administrative endpoints
- **`swagger.routes.js`** - API documentation

### **Middleware**

- **`auth.middleware.js`** - JWT authentication and role verification
- **`routeHandlers.js`** - Common route handling utilities

### **Helpers (Utility Functions)**

- **`catchError.js`** - Error handling utilities
- **`rateLimiter.js`** - Rate limiting configuration
- **`timeUtils.js`** - Time-related utilities
- **`upload.js`** - File upload configuration

#### **Meeqat Configuration Helpers**

- **`meeqatConfigFormatTime.helper.js`** - Time formatting utilities
- **`meeqatConfigProcessTime.helper.js`** - Time processing logic

#### **Mosque Meeqat Helpers**

- **`dateHelpers.js`** - Date manipulation utilities
- **`htmlHelpers.js`** - HTML generation helpers
- **`meeqatGeneratorHelpers.js`** - Timing generation logic
- **`pipelineHelpers.js`** - MongoDB aggregation helpers
- **`roundingHelpers.js`** - Time rounding utilities
- **`timeFormatHelpers.js`** - Time formatting functions

#### **Schedule Helpers**

- **`dateTimeHelpers.js`** - DateTime utilities
- **`defaultDateHelpers.js`** - Default date handling
- **`scheduleBuilderHelpers.js`** - Schedule construction logic

#### **Export Helpers**

- **`csvExportHelper.js`** - CSV export functionality
- **`htmlExportHelper.js`** - HTML export functionality
- **`icsExportHelper.js`** - Calendar export functionality

#### **Official Meeqat Helpers**

- **`officialMeeqatFormatTime.helper.js`** - Official timing formatting
- **`parseCSVBuffer.js`** - CSV parsing utilities

### **External Services**

- **`mapbox.js`** - Mapbox integration for location services

### **Swagger Documentation**

- **`swagger/config.js`** - Swagger configuration
- **`swagger/paths/`** - API endpoint documentation
- **`swagger/schemas/`** - Data model documentation

---

## 🔐 **Authentication & Authorization**

### **Authentication Flow**

1. **Google OAuth** - User signs in with Google account
2. **JWT Token** - Server generates JWT for authenticated sessions
3. **Role-Based Access** - Permissions based on user role

### **User Roles & Permissions**

- **Users**: `timing:read` - View prayer times
- **Editors**: `timing:read`, `timing:edit`, `config:edit` - Manage assigned mosques
- **Admins**: All editor permissions + `editor:manage`, `user:manage` - System administration
- **Super Admin**: Full system control (to be implemented)

---

## 🗄️ **Data Models & Relationships**

### **Core Entities**

1. **User** ↔ **EditorRequest** (one-to-many)
2. **Mosque** ↔ **MeeqatConfig** (one-to-one)
3. **OfficialMeeqat** ↔ **MosqueMeeqat** (one-to-many)
4. **MosqueMeeqat** ↔ **MosqueSchedule** (one-to-many)
5. **Mosque** ↔ **MosqueSpecialEvent** (one-to-many)

### **Data Flow**

```
Official Prayer Times → Mosque Config → Custom Timings → Final Schedule
     (CSV)              (Rules)         (Generated)      (Events)
```

---

## 🚀 **API Features**

### **Core Functionality**

- **Prayer Time Management** - Official and custom prayer times
- **Mosque Configuration** - Adjustment rules and settings
- **Schedule Generation** - Automated schedule creation
- **User Management** - Role-based access control
- **Data Import/Export** - CSV processing and calendar exports
- **Location Services** - Mosque search and mapping

### **Export Formats**

- **CSV** - Tabular data export
- **HTML** - Web-friendly format
- **ICS** - Calendar integration

---

## 🛠️ **Development & Deployment**

### **Scripts**

- **`npm start`** - Production server
- **`npm run dev`** - Development with nodemon
- **`npm run build`** - Build step (placeholder)
- **`npm run lint`** - Linting (placeholder)
- **`npm test`** - Testing (placeholder)

### **Environment Configuration**

- **Port**: 9040 (default)
- **Database**: MongoDB connection string
- **Google OAuth**: Client ID and secrets
- **CORS**: Allowed origins configuration
- **Security**: Helmet and rate limiting

### **Docker Support**

- **Dockerfile** - Container configuration
- **Multi-stage build** - Optimized production image

---

## 📚 **API Documentation**

### **Swagger Integration**

- **Auto-generated** from JSDoc comments
- **Interactive testing** via Swagger UI
- **Schema validation** and examples
- **Endpoint**: `/api/docs`

---

## 🔒 **Security Features**

### **Protection Mechanisms**

- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - API abuse prevention
- **JWT Validation** - Secure authentication
- **Input Validation** - Data sanitization

---

## 📊 **Data Processing**

### **Time Handling**

- **Minutes from midnight** (0-1439) for calculations
- **Date-independent format** (day 1-366) for year transitions
- **Rounding algorithms** for prayer time adjustments
- **Timezone considerations** for global usage

### **CSV Processing**

- **Buffer parsing** for file uploads
- **Data validation** and transformation
- **Bulk import** capabilities
- **Error handling** for malformed data

---

## 🌐 **External Integrations**

### **Services**

- **Google OAuth** - User authentication
- **Mapbox** - Location and mapping services
- **MongoDB Atlas** - Cloud database (assumed)

---

## 📈 **Scalability Considerations**

### **Architecture Benefits**

- **Modular design** for easy feature addition
- **Service layer** for business logic separation
- **Helper functions** for code reusability
- **Middleware pattern** for cross-cutting concerns
- **Environment-based configuration** for deployment flexibility

---

## 🔮 **Future Enhancements**

### **Planned Features**

- **Super Admin role** implementation
- **Testing framework** integration
- **Linting and code quality** tools
- **Performance monitoring** and logging
- **Mobile application** support
- **Real-time notifications** for prayer times

---

_This outline provides a comprehensive overview of the SALAH codebase structure, architecture, and components. For detailed implementation specifics, refer to the individual source files and the main README.md documentation._
