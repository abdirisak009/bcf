package database

import (
	"fmt"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect opens a PostgreSQL connection via GORM.
func Connect(dsn string, logMode logger.LogLevel) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logMode),
	})
	if err != nil {
		return nil, fmt.Errorf("gorm open: %w", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	return db, nil
}

// pgQuoteLiteral wraps s as a PostgreSQL string literal (safe for embedding in SQL).
func pgQuoteLiteral(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}

// uniqueAlignments maps tables/columns to GORM's uniqueIndex names so PostgreSQL
// default names (e.g. trainings_slug_key) are renamed before AutoMigrate.
var uniqueAlignments = []struct {
	Table, Column, Want string
}{
	{"users", "email", "uni_users_email"},
	{"trainings", "slug", "uni_trainings_slug"},
}

func alignPGUniqueConstraints(db *gorm.DB) error {
	for _, a := range uniqueAlignments {
		q := fmt.Sprintf(`
DO $$
DECLARE
	cname text;
BEGIN
	SELECT c.conname INTO cname
	FROM pg_constraint c
	JOIN pg_class t ON c.conrelid = t.oid
	JOIN pg_namespace n ON t.relnamespace = n.oid
	CROSS JOIN LATERAL unnest(c.conkey) AS u(attnum)
	JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
	WHERE t.relname = %s AND n.nspname = CURRENT_SCHEMA()
		AND c.contype = 'u' AND a.attname = %s
	LIMIT 1;

	IF cname IS NOT NULL AND cname <> %s THEN
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = %s) THEN
			EXECUTE format('ALTER TABLE %%I RENAME CONSTRAINT %%I TO %%I', %s, cname, %s);
		END IF;
	END IF;
END $$;
`, pgQuoteLiteral(a.Table), pgQuoteLiteral(a.Column), pgQuoteLiteral(a.Want), pgQuoteLiteral(a.Want), pgQuoteLiteral(a.Table), pgQuoteLiteral(a.Want))
		if err := db.Exec(q).Error; err != nil {
			return fmt.Errorf("%s.%s: %w", a.Table, a.Column, err)
		}
	}
	return nil
}

// AutoMigrate runs GORM migrations for all registered models.
func AutoMigrate(db *gorm.DB, models ...any) error {
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`).Error; err != nil {
		return fmt.Errorf("extension pgcrypto: %w", err)
	}
	if err := alignPGUniqueConstraints(db); err != nil {
		return fmt.Errorf("align pg unique constraints: %w", err)
	}
	return db.AutoMigrate(models...)
}
