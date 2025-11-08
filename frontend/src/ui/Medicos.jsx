import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

const initialForm = {
  matricula: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  especialidades: [], // ids
};

export default function Medicos() {
  const [items, setItems] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return items;
    return items.filter((m) =>
      (m.apellido + " " + m.nombre + " " + (m.matricula || "")).toLowerCase().includes(f)
    );
  }, [items, filter]);

  const loadMedicos = async () => {
    try {
      const { data } = await api.get("/medicos/");
      setItems(data);
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  };

  const loadEspecialidades = async () => {
    try {
      const { data } = await api.get("/especialidades/");
      setEspecialidades(data);
    } catch (e) {
      console.error(e);
      setEspecialidades([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadMedicos(), loadEspecialidades()]);
      setLoading(false);
    })();

    // ⬇️ Cuando cambian especialidades en el otro módulo,
    // refrescamos especialidades **y también** la grilla de médicos
    const handler = async () => {
      await Promise.all([loadEspecialidades(), loadMedicos()]);
    };
    window.addEventListener("especialidades:changed", handler);
    return () => window.removeEventListener("especialidades:changed", handler);
  }, []);

  const openCreate = async () => {
    await loadEspecialidades(); // asegurar lista actualizada
    setForm(initialForm);
    setEditingId(null);
    setErrorMsg("");
    document.getElementById("dlgMedico").showModal();
  };

  const openEdit = async (m) => {
    await loadEspecialidades(); // asegurar lista actualizada
    const sel = m.especialidades_ids
      ? m.especialidades_ids.split(",").map((x) => parseInt(x, 10))
      : [];
    setForm({
      matricula: m.matricula || "",
      nombre: m.nombre || "",
      apellido: m.apellido || "",
      email: m.email || "",
      telefono: m.telefono || "",
      especialidades: sel,
    });
    setEditingId(m.id);
    setErrorMsg("");
    document.getElementById("dlgMedico").showModal();
  };

  const closeDialog = () => document.getElementById("dlgMedico").close();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onChangeMulti = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value, 10));
    setForm((s) => ({ ...s, especialidades: selected }));
  };

  const validate = () => {
    if (!form.nombre?.trim()) return "El nombre es obligatorio";
    if (!form.apellido?.trim()) return "El apellido es obligatorio";
    return "";
  };

  const save = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErrorMsg(v);
      return;
    }
    try {
      if (editingId) {
        await api.put(`/medicos/${editingId}`, form);
      } else {
        await api.post(`/medicos/`, form);
      }
      await loadMedicos(); // refrescar grilla
      closeDialog();
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al guardar";
      setErrorMsg(msg);
    }
  };

  const remove = async (m) => {
    if (!confirm(`¿Eliminar a ${m.apellido}, ${m.nombre}?`)) return;
    try {
      await api.delete(`/medicos/${m.id}`);
      await loadMedicos(); // refrescar grilla
    } catch (e) {
      alert("No se pudo eliminar");
    }
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-bold">Médicos</span>
        <div className="d-flex gap-2">
          <input
            className="form-control form-control-sm"
            placeholder="Buscar (apellido, nombre o matrícula)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 300 }}
          />
          <button className="btn btn-sm btn-primary" onClick={openCreate}>
            + Nuevo
          </button>
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-muted">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-muted">Sin resultados</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Matrícula</th>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Especialidades</th>
                  <th style={{ width: 160 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>{m.matricula || "-"}</td>
                    <td>{m.apellido}</td>
                    <td>{m.nombre}</td>
                    <td>{m.email || "-"}</td>
                    <td>{m.telefono || "-"}</td>
                    <td>{m.especialidades || "-"}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => openEdit(m)}
                      >
                        Editar
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(m)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <dialog
        id="dlgMedico"
        className="rounded-3"
        style={{ border: "1px solid #444", padding: 0, maxWidth: 720 }}
      >
        <form onSubmit={save} method="dialog">
          <div className="modal-header p-3 border-bottom">
            <h5 className="modal-title m-0">{editingId ? "Editar médico" : "Nuevo médico"}</h5>
            <button type="button" className="btn-close" onClick={closeDialog} />
          </div>

          <div className="modal-body p-3">
            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label">Matrícula</label>
                <input name="matricula" value={form.matricula} onChange={onChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Nombre *</label>
                <input name="nombre" value={form.nombre} onChange={onChange} className="form-control" />
              </div>
              <div className="col-md-5">
                <label className="form-label">Apellido *</label>
                <input name="apellido" value={form.apellido} onChange={onChange} className="form-control" />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input name="email" type="email" value={form.email} onChange={onChange} className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={onChange} className="form-control" />
              </div>

              <div className="col-12">
                <label className="form-label">Especialidades</label>
                <select
                  multiple
                  className="form-select"
                  value={form.especialidades}
                  onChange={onChangeMulti}
                  size={Math.min(8, Math.max(3, especialidades.length))}
                >
                  {especialidades.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
                <div className="form-text">Ctrl/Cmd + click para seleccionar múltiples.</div>
              </div>
            </div>
          </div>

          <div className="modal-footer p-3 border-top">
            <button type="button" className="btn btn-outline-secondary" onClick={closeDialog}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
