from datetime import datetime

def parse_dt(value: str):
    # Expecting ISO-like 'YYYY-MM-DD HH:MM'
    return datetime.strptime(value, "%Y-%m-%d %H:%M")
