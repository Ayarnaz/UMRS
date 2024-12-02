
# Unified Interhospital Medical Record System - README

Welcome to the Unified Interhospital Medical Record System (UIMRS), a streamlined solution designed to centralize patient health information across multiple healthcare providers, ensuring a seamless and secure exchange of medical data. This system facilitates real-time access to medical records, appointments, and notifications, empowering patients, healthcare professionals, and healthcare institutions to collaborate more effectively.



## Features

- **Secure Authentication:** Role-based login for Patients, Healthcare Professionals, and Healthcare Institutes with 2FA integration for enhanced security.
- **Comprehensive Medical Records:** Patients can access their medical history from various healthcare providers through a unified interface.
- **Appointment Management:** Allows patients to create personal appointments, while healthcare professionals and institutions manage organizational schedules.
- **Medical Record Sharing:** Healthcare professionals and institutions can request and send patient medical records as needed, with clear tracking and notifications.



## Tech Stack

### Backend:

- **Java:** Core language used for backend development.
- **Spark Java:** Lightweight framework for building the web server.
- **SQLite:** Relational database for storing patient, professional, institute, and medical record data.
- **PBKDF2 with SHA-256:** Password hashing and salting for secure login management.
- **HikariCP:** Connection pooling to improve database performance.

### Frontend:

- **React.js:** JavaScript library for building user interfaces.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **Lucide React:** Icon library for UI components.
- **React Router:** For routing and navigation.
- **Axios:** Promise-based HTTP client for interacting with RESTful APIs.
- **React-Toastify:** For displaying toast notifications.

## Development Tools:
- **Visual Code:** Devlop the system's codebase
- **Git:** Version control for managing source code.
- **npm:** Node Package Manager for managing frontend libraries.
## System Design:

The system utilizes a modular design, with separate components for user authentication, medical record management, appointment scheduling, and notifications. Data is securely stored in SQLite, and interactions are handled via RESTful APIs. The frontend communicates with the backend to fetch and display data dynamically.

