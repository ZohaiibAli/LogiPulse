"""One-off migration: add the Day-2 "Peak Hours" priority columns to the
already-existing `orders` table on the live Neon DB.

create_all() only creates missing tables, it never alters existing ones, so
this has to run once by hand:
    python migrate_add_priority.py
"""
from sqlalchemy import text
from config.db import engine

STATEMENTS = [
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'normal' NOT NULL",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS priority_fee FLOAT DEFAULT 200 NOT NULL",
]

with engine.connect() as conn:
    for stmt in STATEMENTS:
        print(stmt)
        conn.execute(text(stmt))
    conn.commit()

print("Done.")
