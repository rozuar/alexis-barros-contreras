package db

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ArtworkRow struct {
	ID             string
	Title          string
	PaintedLocation string
	StartDate      *time.Time
	EndDate        *time.Time
	InProgress     bool
	Detalle        string
	Bitacora       string
}

func Connect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	cfg.MaxConns = 10
	cfg.MinConns = 1
	cfg.MaxConnLifetime = 30 * time.Minute
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}

func Migrate(ctx context.Context, pool *pgxpool.Pool, migrationsDir string) error {
	path := filepath.Join(migrationsDir, "001_init.sql")
	b, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read migration: %w", err)
	}
	// very small/simple migration runner
	sql := string(b)
	stmts := splitSQLStatements(sql)
	for _, s := range stmts {
		if strings.TrimSpace(s) == "" {
			continue
		}
		if _, err := pool.Exec(ctx, s); err != nil {
			return fmt.Errorf("migration exec failed: %w", err)
		}
	}
	return nil
}

func splitSQLStatements(sql string) []string {
	// Strip "--" comment lines, then naive split by ';' (ok for our simple file)
	lines := strings.Split(sql, "\n")
	buf := make([]string, 0, len(lines))
	for _, ln := range lines {
		t := strings.TrimSpace(ln)
		if strings.HasPrefix(t, "--") {
			continue
		}
		buf = append(buf, ln)
	}
	clean := strings.Join(buf, "\n")
	parts := strings.Split(clean, ";")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		out = append(out, p)
	}
	return out
}

func GetArtwork(ctx context.Context, pool *pgxpool.Pool, id string) (*ArtworkRow, error) {
	row := pool.QueryRow(ctx, `
		SELECT id, title, painted_location, start_date, end_date, in_progress, detalle, bitacora
		FROM artworks
		WHERE id=$1
	`, id)

	var r ArtworkRow
	if err := row.Scan(&r.ID, &r.Title, &r.PaintedLocation, &r.StartDate, &r.EndDate, &r.InProgress, &r.Detalle, &r.Bitacora); err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &r, nil
}

func UpsertArtwork(ctx context.Context, pool *pgxpool.Pool, r ArtworkRow) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO artworks (id, title, painted_location, start_date, end_date, in_progress, detalle, bitacora)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		ON CONFLICT (id) DO UPDATE SET
			title=EXCLUDED.title,
			painted_location=EXCLUDED.painted_location,
			start_date=EXCLUDED.start_date,
			end_date=EXCLUDED.end_date,
			in_progress=EXCLUDED.in_progress,
			detalle=EXCLUDED.detalle,
			bitacora=EXCLUDED.bitacora,
			updated_at=NOW()
	`, r.ID, r.Title, r.PaintedLocation, r.StartDate, r.EndDate, r.InProgress, r.Detalle, r.Bitacora)
	return err
}


