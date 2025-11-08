
from flask import Blueprint, request, jsonify
from ..db import get_db

bp = Blueprint("reportes", __name__)

@bp.get("/turnos-por-medico")
def turnos_por_medico():
    medico_id = request.args.get("medico_id", type=int)
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")
    db = get_db()
    rows = db.execute(
        """
        SELECT t.*, p.apellido||', '||p.nombre AS paciente, m.apellido||', '||m.nombre AS medico
        FROM turnos t
        JOIN pacientes p ON p.id = t.paciente_id
        JOIN medicos m ON m.id = t.medico_id
        WHERE (? IS NULL OR t.medico_id = ?)
          AND (? IS NULL OR t.fecha_hora >= ?)
          AND (? IS NULL OR t.fecha_hora <= ?)
        ORDER BY t.fecha_hora DESC
        """, (medico_id, medico_id, desde, desde, hasta, hasta)
    ).fetchall()
    return jsonify([dict(r) for r in rows])

@bp.get("/turnos-por-especialidad")
def turnos_por_especialidad():
    db = get_db()
    rows = db.execute(
        """
        SELECT e.nombre AS especialidad, COUNT(*) AS cantidad
        FROM turnos t
        JOIN especialidades e ON e.id = t.especialidad_id
        GROUP BY e.id, e.nombre
        ORDER BY cantidad DESC
        """
    ).fetchall()
    return jsonify([dict(r) for r in rows])

@bp.get("/asistencia")
def asistencia():
    db = get_db()
    rows = db.execute(
        """
        SELECT estado, COUNT(*) as cantidad
        FROM turnos
        GROUP BY estado
        """
    ).fetchall()
    return jsonify([dict(r) for r in rows])
