<h1 align="center">🩺 Turnero Médico – Grupo 23 (UTN-FRC)</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11%2B-blue?logo=python" />
  <img src="https://img.shields.io/badge/Flask-3.0-orange?logo=flask" />
  <img src="https://img.shields.io/badge/React-18.3-blue?logo=react" />
  <img src="https://img.shields.io/badge/Bootstrap-5.3-purple?logo=bootstrap" />
  <img src="https://img.shields.io/badge/SQLite-Database-green?logo=sqlite" />
  <img src="https://img.shields.io/badge/License-Academic-lightgrey" />
</p>

---

## 🎯 Objetivo del Proyecto
Desarrollar una aplicación web **Full Stack (Flask + React)** que optimice la gestión de turnos médicos, permitiendo registrar pacientes, médicos y especialidades, garantizando la **asignación eficiente sin superposiciones**.  
Además, el sistema proporciona **herramientas de seguimiento clínico**, como historial médico, emisión de recetas y reportes estadísticos de la actividad asistencial.

---

## 🧩 Alcance Funcional

✅ **Gestión de Pacientes, Médicos y Especialidades**  
✅ **Administración de turnos** con validación de disponibilidad horaria y control de superposición  
✅ **Registro de historia clínica** y **recetas electrónicas**  
✅ **Reportes** de turnos por médico y especialidad  
✅ **Estadísticas de asistencia** (atendidos vs. ausentes)  
💌 **Notificaciones automáticas por correo electrónico (opcional)**  

---

## 🗄️ Diagrama Entidad–Relación (DER)
<p align="center">
  <img src="docs/DER.jpg" width="750px">
</p>

---

## ⚙️ Tecnologías Utilizadas

| Tecnología | Descripción |
|-------------|-------------|
| 🐍 **Python** | Lenguaje principal de desarrollo |
| 🌐 **Flask** | Framework backend que gestiona la lógica del sistema y la API REST |
| ⚛️ **React.js (con Vite)** | Librería de JavaScript para construir el frontend interactivo |
| 💾 **SQLite3** | Base de datos relacional liviana integrada al proyecto |
| 🎨 **Bootstrap 5** | Framework CSS para interfaz moderna y responsive |
| 🧪 **Pytest** | Pruebas unitarias e integración en el backend |
| 🔄 **Fetch / Axios** | Comunicación entre frontend y backend (API REST) |

---

## 🚀 Cómo ejecutar el proyecto

### 1️⃣ Backend (Flask + SQLite)
```bash
cd backend-flask
python -m venv .venv
source .venv/bin/activate   # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
python app.py
