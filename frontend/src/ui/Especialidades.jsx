import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

const initialForm = { nombre: "" };

export default function Especialidades() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return items;
    return items.filter(e => e.nombre.toLowerCase().includes(f));
  }, [items, filter]);

  const fetchData = async () => {
  setLoading(true);
  try {
    const { data } = await api.get("/especialidades");
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
    document.getElementById("dlgEsp").showModal();
  };

  const openEdit = (e) => {
    setForm({ nombre: e.nombre });
    setEditingId(e.id);
    setErrorMsg("");
    document.getElementById("dlgEsp").showModal();
  };

  const closeDialog = () => document.getElementById("dlgEsp").close();
  const onChange = (ev) => setForm({ nombre: ev.target.value });

  const validate = () => {
    if (!form.nombre?.trim()) return "El nombre es obligatorio";
    return "";
  };

  const save = async (ev) => {
    ev.preventDefault();
    const v = validate();
    if (v) { setErrorMsg(v); return; }

    try {
      if (editingId) {
        const { data } = await api.put(`/especialidades/${editingId}`, form);
        setItems(prev => prev.map(x => x.id === editingId ? data : x));
      } else {
        const { data } = await api.post(`/especialidades`, form);
        setItems(prev => [data, ...prev]);
      }
      // avisar a otros componentes (Medicos) que cambió la lista
      window.dispatchEvent(new CustomEvent("especialidades:changed"));
      closeDialog();
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al guardar (¿nombre duplicado?)";
      setErrorMsg(msg);
    }
  };

  const remove = async (e) => {
    if (!confirm(`¿Eliminar la especialidad "${e.nombre}"?`)) return;
    try {
      await api.delete(`/especialidades/${e.id}`);
      setItems(prev => prev.filter(x => x.id !== e.id));
      window.dispatchEvent(new CustomEvent("especialidades:changed"));
    } catch (err) {
      alert(err?.response?.data?.error || "No se pudo eliminar");
    }
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-bold">Especialidades</span>
        <div className="d-flex gap-2">
          <input
            className="form-control form-control-sm"
            placeholder="Buscar por nombre"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 260 }}
          />
          <button className="btn btn-sm btn-primary" onClick={openCreate}>
            + Nueva
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
                  <th>Nombre</th>
                  <th style={{width: 160}}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td>{e.nombre}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(e)}>Editar</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(e)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal con <dialog> */}
      <dialog id="dlgEsp" className="rounded-3" style={{border: "1px solid #444", padding: 0, maxWidth: 520}}>
        <form onSubmit={save} method="dialog">
          <div className="modal-header p-3 border-bottom">
            <h5 className="modal-title m-0">{editingId ? "Editar especialidad" : "Nueva especialidad"}</h5>
            <button type="button" className="btn-close" onClick={closeDialog} />
          </div>
          <div className="modal-body p-3">
            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
            <label className="form-label">Nombre *</label>
            <input className="form-control" value={form.nombre} onChange={onChange} />
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
