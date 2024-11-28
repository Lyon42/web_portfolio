DROP TABLE IF EXISTS photos;

CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path NVARCHAR(260) NOT NULL,
    thumbnail_path NVARCHAR(260) NOT NULL,
    aspect_ratio FLOAT NOT NULL
);