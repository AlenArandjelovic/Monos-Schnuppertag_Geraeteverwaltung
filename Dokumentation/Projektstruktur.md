# Projekt-Dokumentation

## 2. Systemarchitektur (Gesamtübersicht)

Das Projekt besteht aus drei wesentlichen Teilen:

- Frontend: React + Vite
- Backend: Spring Boot 3 + Java 21
- Datenbank: MySQL 8

Die Anwendung bildet eine einfache Geräteverwaltung. Das Frontend stellt eine Benutzeroberfläche zur Verfügung, über die Geräte erfasst und angezeigt werden können. Das Backend übernimmt die Geschäftslogik und stellt eine REST-API bereit. Im Backend werden DTOs verwendet, um die API-Datenstrukturen von der internen JPA-Entity zu trennen. Die Daten werden in einer MySQL-Datenbank gespeichert.

### Gesamtaufbau

1. Der Benutzer öffnet die React-Anwendung im Browser.
2. Das Frontend sendet HTTP-Requests an das Backend.
3. Das Backend verarbeitet die Anfragen und nutzt JPA/Hibernate zur Persistenz.
4. Die Daten werden in der MySQL-Datenbank abgelegt.
5. Die Daten werden anschließend wieder an das Frontend zurückgeliefert.

### Architekturmodell

```text
Browser
  │
  ▼
Frontend (React/Vite)
  │  HTTP + JSON
  ▼
Backend (Spring Boot REST API)
  │  JPA/Hibernate
  ▼
MySQL-Datenbank
```

---

## 3. Kommunikation zwischen den Komponenten

### 3.1 Frontend ↔ Backend

Das Frontend kommuniziert mit dem Backend über REST-API mit HTTP-Requests.

- Protokoll: HTTP
- Datenformat: JSON
- CORS-Konfiguration: `http://localhost:5173`

Im aktuellen Frontend wird in [frontend/frontend/src/App.jsx](frontend/frontend/src/App.jsx) direkt per `fetch()` mit der API kommuniziert. Das Backend verwendet dafür separate DTO-Klassen wie `DeviceCreateRequestDto`, `DeviceUpdateRequestDto` und `DeviceResponseDto`, um die JSON-Anfragen und -Antworten zu modellieren.

#### Verwendete API-Aufrufe

- `GET http://localhost:8080/devices`
  - Lädt alle Geräte.
- `POST http://localhost:8080/devices`
  - Speichert ein neues Gerät.

#### Datenfluss

- Das Frontend sendet beim Laden der Seite eine `GET`-Anfrage.
- Das Backend liefert eine Liste von Geräten im JSON-Format zurück.
- Beim Speichern eines neuen Geräts sendet das Frontend ein `POST` mit einem JSON-Body.
- Das Backend validiert die Daten und speichert sie in der Datenbank.

### 3.2 Backend ↔ Datenbank

Das Backend nutzt Spring Data JPA mit Hibernate als ORM-Layer.

- Technologie: JPA + Hibernate
- Datenbank: MySQL
- Zugriff: SQL wird durch Hibernate automatisch erzeugt.

Die Verbindung ist in [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties) konfiguriert.

### 3.3 Welche Daten fließen wohin?

| Richtung | Daten | Format |
|---|---|---|
| Frontend → Backend | Geräte-Daten (`name`, `type`, `serialNumber`, `location`, `status`) | JSON |
| Backend → Frontend | Geräteliste oder gespeichertes Gerät | JSON |
| Backend → MySQL | Persistente Geräteinformationen | SQL via Hibernate/JPA |
| MySQL → Backend | Abfrageergebnisse / Entitäten | JDBC / ORM |

### 3.4 Welche Endpoints werden genutzt?

Aktuell im Projekt vorhanden:

- `GET /devices`
- `POST /devices`
- `PUT /devices/{id}`
- `DELETE /devices/{id}`
- `GET /api/hello` (Beispiel-Endpoint aus dem HelloController)

### 3.5 Welche Datenformate werden übertragen?

- JSON für API-Requests und API-Responses
- JDBC/SQL intern für die Datenbankkommunikation
- Java-Entitäten werden von Hibernate in Tabellen abgebildet

---

## 4. Ports & Netzwerkstruktur

### 4.1 Verwendete Ports

| Komponente | Port | Beschreibung |
|---|---:|---|
| Backend | 8080 | Spring Boot REST API |
| Frontend (Vite Dev Server) | 5173 | React-Frontend im Entwicklungsmodus |
| MySQL | 3306 | Datenbankdienst |
| Docker Service `mysql` | 3306 | Exponierter Datenbank-Port |

### 4.2 Services und Ports

In [docker-compose.yml](docker-compose.yml) wird derzeit nur ein Service definiert:

- `mysql`
  - Image: `mysql:8.0`
  - Container-Port: `3306`
  - Host-Port: `3306`

### 4.3 Zugriff zwischen Komponenten

- Das Frontend greift im Entwicklungsmodus auf `http://localhost:8080` zu, um das Backend zu erreichen.
- Das Backend verbindet sich mit der Datenbank über die JDBC-URL `jdbc:mysql://localhost:3306/appdb`.
- Die MySQL-Instanz ist über Docker erreichbar und wird auf Port `3306` veröffentlicht.

---

## 5. Ordnerstruktur des Projekts

### Backend

Wichtige Verzeichnisse:

- `backend/src/main/java` → Java-Code, Controller, Entitäten, Repositories
- `backend/src/main/resources` → Konfigurationsdateien
- `backend/pom.xml` → Maven-Abhängigkeiten und Build-Konfiguration
- `backend/src/main/resources/application.properties` → Server- und Datenbankkonfiguration

### Frontend

Wichtige Verzeichnisse:

- `frontend/frontend/src` → React-Quellcode
- `frontend/frontend/src/components` → Komponenten (falls später ergänzt)
- `frontend/frontend/src/pages` → Seiten (falls später ergänzt)
- `frontend/frontend/src/services` → API-Calls (im aktuellen Stand noch direkt in `App.jsx`)
- `frontend/frontend/package.json` → Frontend-Abhängigkeiten und Scripts

### Docker

- `docker-compose.yml` → Definition der Container-Services
- Dockerfiles: im aktuellen Projekt nicht separat vorhanden

---

## 7. Datenbankstruktur

### 7.1 Aktuell vorhandete Tabelle

Die Anwendung verwendet aktuell eine Haupttabelle:

#### `device`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | `BIGINT` | Primärschlüssel, automatisch erzeugt |
| `name` | `VARCHAR` | Name des Geräts |
| `type` | `VARCHAR` | Gerätetyp |
| `serial_number` | `VARCHAR(100)` | Seriennummer |
| `location` | `VARCHAR` | Standort |
| `status` | `VARCHAR` | Status (`aktiv` oder `inaktiv`) |
| `created_at` | `DATE` | Erstellungsdatum |

### 7.2 Beziehungen

Im aktuellen Stand gibt es nur eine einzelne Entity `Device` ohne Fremdschlüsselbeziehungen. Es handelt sich daher um eine einfache, flache Tabellenstruktur.

### 7.3 Normalisierung

Die Tabelle ist im aktuellen Zustand grundsätzlich normalisiert:

- 1NF: Jede Spalte enthält atomare Werte, keine Wiederholungsgruppen.
- 2NF: Es gibt keine Teilabhängigkeiten, da nur eine Entität vorliegt.
- 3NF: Es gibt keine transitiven Abhängigkeiten zwischen nichtschlüsseligen Attributen.

Eine weitergehende Normalisierung wäre nur nötig, wenn zusätzliche Entitäten wie z. B. `Hersteller`, `Kategorie` oder `Standort` eingeführt werden.

### 7.4 ER-Diagramm

```text
+-------------------+
| device            |
+-------------------+
| id                |
| name              |
| type              |
| serial_number     |
| location          |
| status            |
| created_at        |
+-------------------+
```

---

## 8. API Struktur

### 8.1 Liste aller Endpoints

| Methode | Endpoint | Beschreibung |
|---|---|---|
| `GET` | `/devices` | Alle Geräte abrufen |
| `POST` | `/devices` | Neues Gerät anlegen |
| `GET` | `/api/hello` | Beispiel-Health-/Test-Endpoint |

### 8.2 Beispiel Request: Geräte abrufen

```http
GET /devices HTTP/1.1
Host: localhost:8080
```

### 8.3 Beispiel Response: Geräte abrufen

```json
[
  {
    "id": 1,
    "name": "Laptop",
    "type": "Notebook",
    "serialNumber": "ABC123",
    "location": "Büro 1",
    "status": "aktiv",
    "createdAt": "2026-08-05"
  }
]
```

### 8.4 Beispiel Request: Gerät speichern

```http
POST /devices HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "name": "Monitor",
  "type": "Display",
  "serialNumber": "MON-001",
  "location": "Raum 2",
  "status": "aktiv"
}
```

### 8.5 Beispiel Response: Gerät speichern

```json
{
  "id": 2,
  "name": "Monitor",
  "type": "Display",
  "serialNumber": "MON-001",
  "location": "Raum 2",
  "status": "aktiv",
  "createdAt": "2026-08-05"
}
```

### 8.6 DTOs

Im aktuellen Stand werden separate DTO-Klassen verwendet. Die API arbeitet nicht direkt mit der Entity `Device`, sondern nutzt die folgenden DTOs:

- `DeviceCreateRequestDto` für neue Geräte
- `DeviceUpdateRequestDto` für Aktualisierungen vorhandener Geräte
- `DeviceResponseDto` für die API-Antworten

Diese Trennung hilft dabei, das API-Datenmodell vom internen Datenbankmodell sauber zu entkoppeln.

### 8.7 Validierung

Die Validierung erfolgt über Bean Validation in den DTO-Klassen und mit `@Valid` im Controller:

- `name`, `type`, `serialNumber`, `location` und `status` werden auf Länge und Pflichtfelder geprüft.
- `status` muss entweder `aktiv` oder `inaktiv` sein.
- Bei ungültigen Werten wird ein `400 Bad Request` zurückgegeben.

---

## 9. Backend Struktur

### 9.1 Controller

- `DeviceController`
  - Verantwortlich für REST-Endpunkte
  - Bietet `GET /devices`, `POST /devices`, `PUT /devices/{id}` und `DELETE /devices/{id}`
  - Verwendet DTOs für Anfrage- und Antwortdaten
  - Leitet Validierung und Geschäftslogik an den Service weiter

- `HelloController`
  - Beispiel-Controller mit dem Endpoint `GET /api/hello`

### 9.2 Services

Es gibt einen eigenen Service-Layer im Projekt. `DeviceService` kapselt die Geschäftslogik für das Erstellen, Aktualisieren, Laden und Löschen von Geräten. Dadurch bleibt der Controller schlank und die Geschäftslogik wiederverwendbar.

### 9.3 Repositories

- `DeviceRepository`
  - Erbt von `JpaRepository<Device, Long>`
  - Ermöglicht Standard-CRUD-Operationen

### 9.4 Entities

- `Device`
  - Repräsentiert die Datenbanktabelle `device`
  - Enthält Felder wie `name`, `type`, `serialNumber`, `location`, `status` und `createdAt`

### 9.5 Fehlerhandling

Das Backend nutzt einen globalen Exception-Handler (`@RestControllerAdvice`) für Fehlerfälle:

- Validierungsfehler werden als `400 Bad Request` zurückgegeben.
- Nicht gefundene Ressourcen führen zu `404 Not Found`.
- Allgemeine Fehler werden als `500 Internal Server Error` behandelt.
- Dadurch werden Fehler zentral strukturiert und konsistente HTTP-Antworten bereitgestellt.

---

## 10. Frontend Struktur

### 10.1 Seiten und Funktionalität

Das Frontend ist aktuell als Single-Page-Anwendung umgesetzt.

Hauptfunktion:

- Geräte erfassen
- Geräte anzeigen
- Geräteliste laden

### 10.2 Komponenten

Im aktuellen Stand liegt die komplette UI-Logik in einer Datei:

- `App.jsx`

Darin werden:

- Geräte geladen
- Formularwerte verwaltet
- Geräte gespeichert
- Fehlerzustände dargestellt

### 10.3 State Management

Das Frontend nutzt React-States:

- `devices`
- `form`
- `isLoading`
- `isSaving`
- `error`

### 10.4 API Service

Die API-Kommunikation läuft direkt im Frontend-Code über `fetch()`.

### 10.5 Routing

Im aktuellen Projekt gibt es noch kein Routing-System. Es wird nur eine Hauptansicht angezeigt.

---

## Abschluss

Das Projekt ist aktuell eine kleine, klar strukturierte Full-Stack-Anwendung mit:

- React-Frontend für die Benutzeroberfläche
- Spring Boot-Backend für die API und Geschäftslogik
- MySQL-Datenbank für die Datenhaltung
- Docker-Compose für den Datenbankservice

Die Anwendung ist gut geeignet als Einstieg in eine REST-basierte Geräteverwaltung mit Java/Spring und React.
