DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS exhibitions;

CREATE TABLE photos (
    path TEXT PRIMARY KEY,
    thumbnail_path TEXT NOT NULL,
    aspect_ratio FLOAT NOT NULL
);

CREATE TABLE exhibitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    visible BOOLEAN DEFAULT FALSE NOT NULL,
    structure TEXT DEFAULT "[]" NOT NULL
);

INSERT INTO exhibitions (name, visible) VALUES ("portfolio", FALSE);