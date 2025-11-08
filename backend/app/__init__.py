# backend/app/__init__.py
from flask import Flask, jsonify
from flask_cors import CORS
from .db import init_db, close_db  

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        DATABASE="instance/data.db",
        JSON_AS_ASCII=False,
    )

    # Cerrar conexión al final de cada request
    app.teardown_appcontext(close_db)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Importá SOLO blueprints reales
    from .routes import pacientes as pacientes_bp
    from .routes import medicos as medicos_bp
    from .routes import especialidades as especialidades_bp
    from .routes import turnos as turnos_bp
    # (Si tenés routes/reportes.py y lo usás, podés importarlo también)

    app.register_blueprint(pacientes_bp.bp)
    app.register_blueprint(medicos_bp.bp)
    app.register_blueprint(especialidades_bp.bp)
    app.register_blueprint(turnos_bp.bp)

    @app.get("/api/health")
    def health():
        return jsonify({"ok": True})

    return app



# Comando CLI para init-db
import click
@click.command("init-db")
def init_db_command():
    app = create_app()
    with app.app_context():
        init_db()
    click.echo("DB inicializada.")
