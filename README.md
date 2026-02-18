# IT342_TindaTrack_G4_Temperatura

**Project**: TindaTrack - Backend service for temperature tracking (class project)

**Quick Overview**
- **Repo name**: IT342_TindaTrack_G4_Temperatura
- **Backend**: Spring Boot (Maven)
- **Database**: external (configure below)

**Prerequisites**
- **Java**: JDK 17 or compatible
- **Maven**: 3.6+ (or use the included `mvnw` / `mvnw.cmd` wrappers)
- **Database server**: PostgreSQL or MySQL (or another JDBC-compatible DB)

**Database setup (notes)**
- The project expects database settings to be placed in [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties#L1).
- Example `application.properties` snippets you can use as a starting point:

PostgreSQL example:

spring.datasource.url=jdbc:postgresql://localhost:5432/tindatrack_db
spring.datasource.username=tindatrack_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

MySQL example:

spring.datasource.url=jdbc:mysql://localhost:3306/tindatrack_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=tindatrack_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

Replace credentials and host/port as needed. For production, prefer environment variables or a secrets manager.

**Run (backend)**
- From repo root, run:

```powershell
cd backend
./mvnw spring-boot:run
```

Or using local Maven:

```powershell
cd backend
mvn spring-boot:run
```

**Project structure**
- `backend/` : Spring Boot backend
	- `mvnw`, `mvnw.cmd`, `pom.xml` : Maven wrapper + project config
	- `src/main/java/com/tindatrack/backend/BackendApplication.java` : application entrypoint
	- `src/main/resources/application.properties` : app configuration (database settings should go here)
	- `src/main/resources/static/` : static assets (if any)
	- `src/main/resources/templates/` : server-rendered templates (if used)
	- `src/test/java/...` : unit/integration tests
- `target/` : build output (generated)

**Web (frontend)**
- Framework: React + Vite
- Location: `web/`
- Key files:
	- `web/package.json` : project metadata and scripts
	- `web/vite.config.js` : Vite config
	- `web/index.html` : SPA entry
	- `web/src/` : React source files

**Prerequisites (frontend)**
- **Node.js**: 16+ recommended
- **npm** or **yarn**

**Run (frontend)**
- From repo root, run:

```powershell
cd web
npm install
npm run dev
```

Build for production:

```powershell
cd web
npm run build
```

Preview production build locally:

```powershell
cd web
npm run preview
```

**Integration notes**
- The backend runs on Spring Boot (default port `8080`). If the frontend calls the backend API, point requests to `http://localhost:8080` (or the configured backend host/port).
- During development, you can configure a Vite proxy in `web/vite.config.js` to forward API requests to the backend to avoid CORS issues.
