from flask import Blueprint, request, jsonify
from app.db import get_db, row_to_dict

bp = Blueprint("medicos", __name__, url_prefix="/api/medicos")

@bp.get("/")  # ← antes estaba ""
def list_medicos():
    db = get_db()
    rows = db.execute(
        """
        SELECT m.*,
               GROUP_CONCAT(e.nombre, ', ') AS especialidades,
               GROUP_CONCAT(e.id)          AS especialidades_ids
        FROM medicos m
        LEFT JOIN medico_especialidad me ON me.medico_id = m.id
        LEFT JOIN especialidades e ON e.id = me.especialidad_id
        GROUP BY m.id
        ORDER BY m.apellido, m.nombre
        """
    ).fetchall()
    return jsonify([row_to_dict(r) for r in rows])

@bp.post("/")  # ← antes estaba ""
def create_medico():
    db = get_db()
    data = request.get_json() or {}
    matricula = data.get("matricula")
    nombre = (data.get("nombre") or "").strip()
    apellido = (data.get("apellido") or "").strip()
    email = data.get("email")
    telefono = data.get("telefono")
    especialidades = data.get("especialidades") or []

    if not nombre or not apellido:
        return jsonify({"error": "Nombre y apellido son obligatorios"}), 400

    cur = db.execute(
        "INSERT INTO medicos(matricula, nombre, apellido, email, telefono) VALUES(?,?,?,?,?)",
        (matricula, nombre, apellido, email, telefono),
    )
    medico_id = cur.lastrowid
    for eid in especialidades:
        db.execute(
            "INSERT INTO medico_especialidad(medico_id, especialidad_id) VALUES(?,?)",
            (medico_id, int(eid)),
        )
    db.commit()

    row = db.execute(
        """
        SELECT m.*,
               GROUP_CONCAT(e.nombre, ', ') AS especialidades,
               GROUP_CONCAT(e.id)          AS especialidades_ids
        FROM medicos m
        LEFT JOIN medico_especialidad me ON me.medico_id = m.id
        LEFT JOIN especialidades e ON e.id = me.especialidad_id
        WHERE m.id = ?
        GROUP BY m.id
        """,
        (medico_id,),
    ).fetchone()
    return jsonify(row_to_dict(row)), 201

@bp.put("/<int:medico_id>")
def update_medico(medico_id: int):
    db = get_db()
    data = request.get_json() or {}
    matricula = data.get("matricula")
    nombre = (data.get("nombre") or "").strip()
    apellido = (data.get("apellido") or "").strip()
    email = data.get("email")
    telefono = data.get("telefono")
    especialidades = data.get("especialidades") or []

    if not nombre or not apellido:
        return jsonify({"error": "Nombre y apellido son obligatorios"}), 400

    db.execute(
        "UPDATE medicos SET matricula=?, nombre=?, apellido=?, email=?, telefono=? WHERE id=?",
        (matricula, nombre, apellido, email, telefono, medico_id),
    )
    db.execute("DELETE FROM medico_especialidad WHERE medico_id=?", (medico_id,))
    for eid in especialidades:
        db.execute(
            "INSERT INTO medico_especialidad(medico_id, especialidad_id) VALUES(?,?)",
            (medico_id, int(eid)),
        )
    db.commit()

    row = db.execute(
        """
        SELECT m.*,
               GROUP_CONCAT(e.nombre, ', ') AS especialidades,
               GROUP_CONCAT(e.id)          AS especialidades_ids
        FROM medicos m
        LEFT JOIN medico_especialidad me ON me.medico_id = m.id
        LEFT JOIN especialidades e ON e.id = me.especialidad_id
        WHERE m.id = ?
        GROUP BY m.id
        """,
        (medico_id,),
    ).fetchone()
    return jsonify(row_to_dict(row))

@bp.delete("/<int:medico_id>")
def delete_medico(medico_id: int):
    db = get_db()
    db.execute("DELETE FROM medico_especialidad WHERE medico_id=?", (medico_id,))
    db.execute("DELETE FROM medicos WHERE id=?", (medico_id,))
    db.commit()
    return "", 204
