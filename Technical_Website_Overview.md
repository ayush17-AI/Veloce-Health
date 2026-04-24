# Technical Website Overview: Veloce Health

## Project Title & Tech Stack
**Project Title:** Veloce Health – High-Performance Remote Telemetry Visualization Platform  
**Tech Stack:** 
*   **Frontend Framework:** Next.js 14 (App Router) for high-performance server-side rendering and client-side interactivity.
*   **Styling:** Tailwind CSS for a modern, responsive design system.
*   **Logic:** TypeScript for type-safe development and robust state management.
*   **Backend & Database:** Supabase (PostgreSQL) for real-time data persistence and authentication.
*   **Hosting & CI/CD:** Netlify for seamless global delivery and automated deployment pipelines.

---

## System Architecture: Edge-to-Cloud Pipeline
Veloce Health implements a sophisticated 'Edge-to-Cloud' pipeline designed for low-latency medical telemetry. 
1.  **Edge Layer (ESP32 Hardware):** IoT hardware sensors collect vital biometric data (Heart Rate, Body Temperature) and transmit encrypted payloads via the **Supabase RESTful API**.
2.  **Cloud Layer (Supabase):** Acts as the centralized ingestion hub, utilizing PostgreSQL for data persistence and a Realtime engine for instantaneous broadcast.
3.  **Visualization Layer (Veloce Web):** A real-time dashboard that consumes the telemetry stream via secure websockets, transforming raw numeric data into physics-based 3D simulations and diagnostic overlays.

---

## Key UI/UX Features

### 1. Homeostatic Balance (3D See-saw) Visualization
The centerpiece of the dashboard is a custom **3D Homeostatic Balance system** built with React Three Fiber. 
*   **Physics Mapping:** The physical tilt of a virtual beam is dynamically calculated based on the delta between Heart Rate (BPM) and Body Temperature.
*   **Diagnostic Indicators:** The see-saw utilizes a high-precision physics engine to visually represent 'Internal Equilibrium.' Deviations from normal physiological ranges cause the beam to tilt, providing an immediate, intuitive health assessment for clinicians.
*   **Interactive Enclosures:** 3D glass enclosures encapsulate the bio-signals, using 'Glassmorphism' aesthetics to maintain a premium, medical-grade feel while allowing users to 'peek' into specific diagnostic portals.

### 2. Real-time Telemetry Feed (BPM & Temp Cards)
Individual telemetry cards provide granular, real-time feedback:
*   **Pulse Dynamics:** An ECG-synced pulsing heart icon and a real-time BPM counter.
*   **Thermal Metrics:** A high-precision temperature readout with dynamic status bars that shift color (Green, Yellow, Red) based on clinical severity.
*   **Connection Diagnostics:** Integrated status indicators showing the health of the hardware-to-cloud link.

### 3. Dynamic Charting & Trend Analysis
The platform features an **ECG Sweep System** that simulates a clinical patient monitor.
*   **Historical Logging:** A dedicated telemetry history log tracks historical trends, allowing users to analyze biometric shifts over time.
*   **Sequence-Driven Reveal:** Telemetry data is presented through a series of cinematic reveals, ensuring that critical data is never overwhelmed by UI noise.

---

## Data Synchronization Logic
To ensure clinical reliability, Veloce Health utilizes a **Dual-Stream Data Synchronization** strategy:
*   **Primary Stream (Supabase Realtime):** Uses WebSockets for sub-100ms latency updates. Any insertion at the database level is pushed instantly to the UI.
*   **Polling Fallback (Zero Data Loss):** In high-latency or restricted bandwidth environments where WebSockets may be unstable, the system automatically switches to a **5-second RESTful polling mechanism**. This redundancy ensures the visualization layer remains accurate even under adverse network conditions.

---

## Security & Data Integrity
*   **User Isolation:** Security is enforced via **UUID-based user identification**, ensuring that hardware telemetry is strictly mapped to the correct patient profile.
*   **Row Level Security (RLS):** Supabase RLS policies are implemented at the database tier to prevent unauthorized access. Data is isolated so that even in a multi-tenant environment, telemetry remains accessible only to authorized sessions.

---

## Diagnostic Thresholds & UI Logic
To facilitate rapid clinical assessment, Veloce Health translates raw numerical telemetry into an intuitive color-coded diagnostic system. The following table outlines the physiological thresholds used to trigger UI state changes:

| Vital Sign | Condition | Range (Fahrenheit/BPM) | Range (Celsius) | UI Indicator |
| :--- | :--- | :--- | :--- | :--- |
| **Heart Rate** | **Normal** | 60 – 90 BPM | 60 – 90 BPM | **Green** (#22C55E) |
| | **Warning (High)** | 91 – 100 BPM | 91 – 100 BPM | **Yellow** (#FACC15) |
| | **Critical (High/Low)**| < 60 or > 100 BPM | < 60 or > 100 BPM | **Red** (#EF4444) |
| **Body Temp** | **Hypothermia Risk** | < 97.5°F | < 36.4°C | **Red** (#EF4444) |
| | **Normal** | 97.5°F – 99.0°F | 36.4°C – 37.2°C | **Green** (#22C55E) |
| | **Elevated / Fever** | 99.1°F – 100.0°F | 37.3°C – 37.8°C | **Yellow** (#FACC15) |
| | **Critical Fever** | > 100.0°F | > 37.8°C | **Red** (#EF4444) |

### Logic Explanation & Dynamic Styling
The UI utilizes a **Reactive State Mapping** architecture to ensure the visual environment accurately reflects the patient's status:
1.  **Analytical Processing:** Upon receiving a telemetry packet, the data is passed to helper functions (`analyzeBPM`, `analyzeTemp`) which compare values against established medical constants.
2.  **Status Tokens:** These functions return a status token (e.g., `good`, `warning`, `danger`).
3.  **CSS Variable Injection:** This token is used to dynamically swap CSS classes or hex codes. For example, the `heartStatus` state directly controls the `color` property of the main BPM display and the stroke color of the ECG wave, while also triggering specific physics-based animations (e.g., increased pulse frequency in the 3D model during Tachycardia).
4.  **Semantic Feedback:** Icons from the Lucide-React library (CheckCircle, AlertCircle, ShieldAlert) are conditionally rendered based on these thresholds to provide secondary visual cues for accessibility and clinical clarity.

---

## Performance Optimization
*   **Vibe Coding Principles:** The UI is architected for maximum responsiveness and 'flow,' utilizing **Framer Motion** for 60-FPS micro-animations and physics-based transitions.
*   **Glassmorphism Aesthetic:** A high-end dark-themed interface utilizing backdrop filters and translucent layering. This design minimizes cognitive load by focusing visual weight on the telemetry data while maintaining a state-of-the-art aesthetic.
*   **Asset Optimization:** 3D models and shaders are optimized for the web, ensuring low memory overhead and high frame rates on both mobile and desktop devices.

