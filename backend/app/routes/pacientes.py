from flask import Blueprint, request, jsonify
from app.db import get_db, row_to_dict

bp = Blueprint("pacientes", __name__, url_prefix="/api/pacientes")

@bp.get("/")  # ← antes estaba ""
def list_pacientes():
    db = get_db()
    rows = db.execute(
        "SELECT id, dni, nombre, apellido, email, telefono FROM pacientes ORDER BY apellido, nombre"
    ).fetchall()
    return jsonify([row_to_dict(r) for r in rows])

@bp.post("/")  # ← antes estaba ""
def create_paciente():
    db = get_db()
    data = request.get_json() or {}
    dni = (data.get("dni") or "").strip()
    nombre = (data.get("nombre") or "").strip()
    apellido = (data.get("apellido") or "").strip()
    email = data.get("email")
    telefono = data.get("telefono")

    if not dni or not nombre or not apellido:
        return jsonify({"error": "DNI, nombre y apellido son obligatorios"}), 400

    # DNI único
    exists = db.execute("SELECT 1 FROM pacientes WHERE dni = ?", (dni,)).fetchone()
    if exists:
        return jsonify({"error": "DNI duplicado"}), 400

    cur = db.execute(
        "INSERT INTO pacientes(dni, nombre, apellido, email, telefono) VALUES(?,?,?,?,?)",
        (dni, nombre, apellido, email, telefono),
    )
    db.commit()
    new_id = cur.lastrowid
    row = db.execute("SELECT * FROM pacientes WHERE id = ?", (new_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201

@bp.put("/<int:paciente_id>")
def update_paciente(paciente_id: int):
    db = get_db()
    data = request.get_json() or {}
    dni = (data.get("dni") or "").strip()
    nombre = (data.get("nombre") or "").strip()
    apellido = (data.get("apellido") or "").strip()
    email = data.get("email")
    telefono = data.get("telefono")

    if not dni or not nombre or not apellido:
        return jsonify({"error": "DNI, nombre y apellido son obligatorios"}), 400

    # DNI único (excluyendo el propio)
    exists = db.execute(
        "SELECT 1 FROM pacientes WHERE dni = ? AND id <> ?", (dni, paciente_id)
    ).fetchone()
    if exists:
        return jsonify({"error": "DNI duplicado"}), 400

    db.execute(
        "UPDATE pacientes SET dni=?, nombre=?, apellido=?, email=?, telefono=? WHERE id=?",
        (dni, nombre, apellido, email, telefono, paciente_id),
    )
    db.commit()
    row = db.execute("SELECT * FROM pacientes WHERE id = ?", (paciente_id,)).fetchone()
    return jsonify(row_to_dict(row))

@bp.delete("/<int:paciente_id>")
def delete_paciente(paciente_id: int):
    db = get_db()
    db.execute("DELETE FROM pacientes WHERE id=?", (paciente_id,))
    db.commit()
    return "", 204
