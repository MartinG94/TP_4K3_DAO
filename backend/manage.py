# backend/manage.py
import click
from app import create_app

@click.group()
def cli():
    pass

@cli.command()
def run():
    app = create_app()
    app.run(debug=True)

@cli.command("init-db")
def init_db_cmd():
    from app.db import init_db
    app = create_app()
    with app.app_context():
        init_db()
    click.echo("DB inicializada (tablas y datos demo).")

if __name__ == "__main__":
    try:
        cli()
    except SystemExit:
        pass
