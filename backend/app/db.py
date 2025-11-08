# backend/app/db.py
import os
import sqlite3
from flask import g, current_app

def _db_path():
    # Usa la ruta configurada o, por defecto, instance/data.db
    return current_app.config.get(
        "DATABASE",
        os.path.join(current_app.instance_path, "data.db"),
    )

def get_db():
    """Devuelve una única conexión por request con row_factory = Row."""
    if "db" not in g:
        g.db = sqlite3.connect(_db_path())
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(_=None):
    """Cierra la conexión guardada en g, si existe."""
    db = g.pop("db", None)
    if db is not None:
        db.close()

def row_to_dict(row):
    """Convierte un sqlite3.Row en dict plano."""
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}

def init_db():
    """
    Crea las tablas desde schema.sql y, si existe, ejecuta seed.sql.
    - schema.sql y seed.sql deben estar en backend/app/
    """
    db = get_db()

    # Ejecutar schema.sql
    schema_path = os.path.join(current_app.root_path, "schema.sql")
    with current_app.open_resource(schema_path) as f:
        db.executescript(f.read().decode("utf-8"))

    # Ejecutar seed.sql si existe
    seed_path = os.path.join(current_app.root_path, "seed.sql")
    if os.path.exists(seed_path):
        with current_app.open_resource(seed_path) as f:
            db.executescript(f.read().decode("utf-8"))

    db.commit()
