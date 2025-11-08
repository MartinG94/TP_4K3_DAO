# backend/app/routes/turnos.py
from flask import Blueprint, request, jsonify
from app.db import get_db, row_to_dict            # ← usamos app.db
from ..validators import parse_dt                 # asumo que ya existe
from datetime import timedelta

bp = Blueprint("turnos", __name__, url_prefix="/api/turnos")  # ← url_prefix correcto

@bp.get("/")                                      # ← antes: @bp.get("")
def list_turnos():
    db = get_db()
    rows = db.execute(
        """
        SELECT t.*,
               p.apellido || ', ' || p.nombre AS paciente,
               m.apellido || ', ' || m.nombre AS medico,
               e.nombre                        AS especialidad
        FROM turnos t
        JOIN pacientes p ON p.id = t.paciente_id
        JOIN medicos   m ON m.id = t.medico_id
        LEFT JOIN especialidades e ON e.id = t.especialidad_id
        ORDER BY t.fecha_hora DESC
        """
    ).fetchall()
    return jsonify([row_to_dict(r) for r in rows])

def _hay_superposicion(db, medico_id, fecha_hora_str, duracion_min, turno_id=None):
    start = parse_dt(fecha_hora_str)
    end = start + timedelta(minutes=duracion_min)
    rows = db.execute(
        """
        SELECT id, fecha_hora, duracion_min
        FROM turnos
        WHERE medico_id = ?
          AND (? IS NULL OR id <> ?)
        """,
        (medico_id, turno_id, turno_id),
    ).fetchall()
    for r in rows:
        s2 = parse_dt(r["fecha_hora"])
        e2 = s2 + timedelta(minutes=r["duracion_min"])
        if start < e2 and s2 < end:
            return True
    return False

@bp.post("/")                                     # ← antes: @bp.post("")
def crear_turno():
    data = request.get_json(force=True)
    db = get_db()

    if _hay_superposicion(
        db,
        data["medico_id"],
        data["fecha_hora"],
        int(data.get("duracion_min", 30)),
    ):
        return jsonify({"error": "Superposición de turno para el médico"}), 400

    cur = db.execute(
        """
        INSERT INTO turnos
          (paciente_id, medico_id, especialidad_id,
           fecha_hora, duracion_min, estado, notas)
        VALUES (?,?,?,?,?,?,?)
        """,
        (
            data["paciente_id"],
            data["medico_id"],
            data["especialidad_id"],
            data["fecha_hora"],
            int(data.get("duracion_min", 30)),
            data.get("estado", "programado"),
            data.get("notas", ""),
        ),
    )
    db.commit()
    row = db.execute("SELECT * FROM turnos WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(row_to_dict(row)), 201

@bp.put("/<int:tid>")
def actualizar_turno(tid):
    data = request.get_json(force=True)
    db = get_db()

    if _hay_superposicion(
        db,
        data["medico_id"],
        data["fecha_hora"],
        int(data.get("duracion_min", 30)),
        turno_id=tid,
    ):
        return jsonify({"error": "Superposición de turno para el médico"}), 400

    db.execute(
        """
        UPDATE turnos
        SET paciente_id = ?,
            medico_id = ?,
            especialidad_id = ?,
            fecha_hora = ?,
            duracion_min = ?,
            estado = ?,
            notas = ?
        WHERE id = ?
        """,
        (
            data["paciente_id"],
            data["medico_id"],
            data["especialidad_id"],
            data["fecha_hora"],
            int(data.get("duracion_min", 30)),
            data.get("estado", "programado"),
            data.get("notas", ""),
            tid,
        ),
    )
    db.commit()
    row = db.execute("SELECT * FROM turnos WHERE id = ?", (tid,)).fetchone()
    return jsonify(row_to_dict(row))
