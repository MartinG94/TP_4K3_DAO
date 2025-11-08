from flask import Blueprint, request, jsonify
from app.db import get_db, row_to_dict

bp = Blueprint("especialidades", __name__, url_prefix="/api/especialidades")

@bp.get("/")  # ← antes estaba ""
def list_especialidades():
    db = get_db()
    rows = db.execute("SELECT id, nombre FROM especialidades ORDER BY nombre").fetchall()
    return jsonify([row_to_dict(r) for r in rows])

@bp.post("/")  # ← antes estaba ""
def create_especialidad():
    db = get_db()
    data = request.get_json() or {}
    nombre = (data.get("nombre") or "").strip()
    if not nombre:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    # nombre único
    exists = db.execute("SELECT 1 FROM especialidades WHERE nombre = ?", (nombre,)).fetchone()
    if exists:
        return jsonify({"error": "Nombre duplicado"}), 400

    cur = db.execute("INSERT INTO especialidades(nombre) VALUES(?)", (nombre,))
    db.commit()
    new_id = cur.lastrowid
    row = db.execute("SELECT * FROM especialidades WHERE id = ?", (new_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201

@bp.put("/<int:esp_id>")
def update_especialidad(esp_id: int):
    db = get_db()
    data = request.get_json() or {}
    nombre = (data.get("nombre") or "").strip()
    if not nombre:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    # nombre único (excluyendo el propio)
    exists = db.execute(
        "SELECT 1 FROM especialidades WHERE nombre = ? AND id <> ?", (nombre, esp_id)
    ).fetchone()
    if exists:
        return jsonify({"error": "Nombre duplicado"}), 400

    db.execute("UPDATE especialidades SET nombre=? WHERE id=?", (nombre, esp_id))
    db.commit()
    row = db.execute("SELECT * FROM especialidades WHERE id = ?", (esp_id,)).fetchone()
    return jsonify(row_to_dict(row))

@bp.delete("/<int:esp_id>")
def delete_especialidad(esp_id: int):
    db = get_db()
    # borrar vínculos
    db.execute("DELETE FROM medico_especialidad WHERE especialidad_id=?", (esp_id,))
    db.execute("DELETE FROM especialidades WHERE id=?", (esp_id,))
    db.commit()
    return "", 204
