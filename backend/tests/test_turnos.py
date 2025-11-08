import os, tempfile, json, pytest
from app import create_app

@pytest.fixture
def client():
    db_fd, db_path = tempfile.mkstemp()
    app = create_app({
        "TESTING": True,
        "DATABASE": db_path,
    })

    with app.app_context():
        from app.db import init_db
        init_db()

    with app.test_client() as client:
        yield client

    os.close(db_fd)
    os.unlink(db_path)

def _post(client, url, payload, code=201):
    rv = client.post(url, data=json.dumps(payload), content_type="application/json")
    assert rv.status_code == code, rv.data
    return rv.get_json()

def test_superposicion_turno(client):
    _post(client, "/api/turnos", {
        "paciente_id": 1, "medico_id": 1, "especialidad_id": 1,
        "fecha_hora": "2025-11-12 09:00", "duracion_min": 30, "estado": "programado"
    })

    rv = client.post("/api/turnos", data=json.dumps({
        "paciente_id": 2, "medico_id": 1, "especialidad_id": 1,
        "fecha_hora": "2025-11-12 09:15", "duracion_min": 30, "estado": "programado"
    }), content_type="application/json")
    assert rv.status_code == 400
    assert "Superposición" in rv.get_json()["error"]
