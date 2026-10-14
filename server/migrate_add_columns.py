"""One-off migration: add columns introduced for the address-details/rating
feature to the already-existing `orders` table on the live Neon DB.

create_all() only creates missing tables, it never alters existing ones, so
this has to run once by hand:
    python migrate_add_columns.py
"""
from sqlalchemy import text
from config.db import engine

STATEMENTS = [
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_details VARCHAR(255)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS dropoff_details VARCHAR(255)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS rating INTEGER",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS review TEXT",
]

with engine.connect() as conn:
    for stmt in STATEMENTS:
        print(stmt)
        conn.execute(text(stmt))
    conn.commit()

print("Done.")
