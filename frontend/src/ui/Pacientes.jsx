import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

const initialForm = { dni: "", nombre: "", apellido: "", email: "", telefono: "" };

export default function Pacientes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return items;
    return items.filter(p =>
      (p.apellido + " " + p.nombre + " " + p.dni).toLowerCase().includes(f)
    );
  }, [items, filter]);

  const fetchData = async () => {
  setLoading(true);
  try {
    const { data } = await api.get("/pacientes");
    setItems(data);
  } catch (e) {
    console.error(e);
    setItems([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setErrorMsg("");
    document.getElementById("dlgPaciente").showModal();
  };

  const openEdit = (p) => {
    setForm({ dni: p.dni || "", nombre: p.nombre || "", apellido: p.apellido || "", email: p.email || "", telefono: p.telefono || "" });
    setEditingId(p.id);
    setErrorMsg("");
    document.getElementById("dlgPaciente").showModal();
  };

  const closeDialog = () => {
    document.getElementById("dlgPaciente").close();
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.dni?.trim()) return "El DNI es obligatorio";
    if (!form.nombre?.trim()) return "El nombre es obligatorio";
    if (!form.apellido?.trim()) return "El apellido es obligatorio";
    return "";
  };

  const save = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrorMsg(v); return; }

    try {
      if (editingId) {
        const { data } = await api.put(`/pacientes/${editingId}`, form);
        setItems(prev => prev.map(p => p.id === editingId ? data : p));
      } else {
        const { data } = await api.post(`/pacientes`, form);
        setItems(prev => [data, ...prev]);
      }
      closeDialog();
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al guardar";
      setErrorMsg(msg);
    }
  };

  const remove = async (p) => {
    if (!confirm(`¿Eliminar a ${p.apellido}, ${p.nombre}?`)) return;
    await api.delete(`/pacientes/${p.id}`);
    setItems(prev => prev.filter(x => x.id !== p.id));
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-bold">Pacientes</span>
        <div className="d-flex gap-2">
          <input
            className="form-control form-control-sm"
            placeholder="Buscar (apellido, nombre o DNI)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 260 }}
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
                  <th style={{width: 120}}>DNI</th>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th style={{width: 160}}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>{p.dni}</td>
                    <td>{p.apellido}</td>
                    <td>{p.nombre}</td>
                    <td>{p.email || "-"}</td>
                    <td>{p.telefono || "-"}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(p)}>Editar</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal simple con <dialog> (no requiere JS de Bootstrap) */}
      <dialog id="dlgPaciente" className="rounded-3" style={{border: "1px solid #444", padding: 0}}>
        <form onSubmit={save} method="dialog">
          <div className="modal-header p-3 border-bottom">
            <h5 className="modal-title m-0">{editingId ? "Editar paciente" : "Nuevo paciente"}</h5>
            <button type="button" className="btn-close" onClick={closeDialog} />
          </div>
          <div className="modal-body p-3">
            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label">DNI *</label>
                <input name="dni" value={form.dni} onChange={onChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Nombre *</label>
                <input name="nombre" value={form.nombre} onChange={onChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Apellido *</label>
                <input name="apellido" value={form.apellido} onChange={onChange} className="form-control" />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input name="email" value={form.email} onChange={onChange} className="form-control" type="email" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={onChange} className="form-control" />
              </div>
            </div>
          </div>
          <div className="modal-footer p-3 border-top">
            <button type="button" className="btn btn-outline-secondary" onClick={closeDialog}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editingId ? "Guardar" : "Crear"}</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
