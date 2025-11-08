import React, { useEffect, useState } from "react";
import axios from "axios";
import Pacientes from "./Pacientes";
import Medicos from "./Medicos";
import Especialidades from "./Especialidades";   // ⬅️ nuevo

function Section({ title, children }) {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-header fw-bold">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export default function App() {
  const [turnos, setTurnos] = useState([]);

  useEffect(() => {
    (async () => {
      const t = await axios.get("/api/turnos");
      setTurnos(t.data);
    })();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-4">Turnero Médico</h1>

      <Pacientes />
      <Medicos />

      {/* CRUD de Especialidades */}
      <Especialidades />

      <Section title="Turnos (demo)">
        <ul className="list-group">
          {turnos.map(t => (
            <li key={t.id} className="list-group-item">
              {t.fecha_hora} — {t.medico} con {t.paciente} ({t.especialidad}) [{t.estado}]
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
