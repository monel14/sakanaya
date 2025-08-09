-- Stock Management Optimization Indexes
-- This migration creates optimal indexes for stock-related queries

-- Stock Levels table indexes
CREATE INDEX IF NOT EXISTS idx_stock_levels_store_product ON stock_levels(store_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_quantity ON stock_levels(quantity) WHERE quantity > 0;
CREATE INDEX IF NOT EXISTS idx_stock_levels_available ON stock_levels(available_quantity) WHERE available_quantity > 0;
CREATE INDEX IF NOT EXISTS idx_stock_levels_last_updated ON stock_levels(last_updated DESC);

-- Stock Movements table indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_store_date ON stock_movements(store_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_date ON stock_movements(product_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type_date ON stock_movements(type, date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_by ON stock_movements(created_by);

-- Bons Reception table indexes
CREATE INDEX IF NOT EXISTS idx_bons_reception_supplier_date ON bons_reception(supplier_id, date_reception DESC);
CREATE INDEX IF NOT EXISTS idx_bons_reception_store_date ON bons_reception(store_id, date_reception DESC);
CREATE INDEX IF NOT EXISTS idx_bons_reception_status ON bons_reception(status);
CREATE INDEX IF NOT EXISTS idx_bons_reception_numero ON bons_reception(numero);

-- Lignes Reception table indexes
CREATE INDEX IF NOT EXISTS idx_lignes_reception_bon ON lignes_reception(bon_reception_id);
CREATE INDEX IF NOT EXISTS idx_lignes_reception_product ON lignes_reception(product_id);

-- Transferts Stock table indexes
CREATE INDEX IF NOT EXISTS idx_transferts_source_date ON transferts_stock(store_source_id, date_creation DESC);
CREATE INDEX IF NOT EXISTS idx_transferts_destination_date ON transferts_stock(store_destination_id, date_creation DESC);
CREATE INDEX IF NOT EXISTS idx_transferts_status ON transferts_stock(status);
CREATE INDEX IF NOT EXISTS idx_transferts_numero ON transferts_stock(numero);

-- Lignes Transfert table indexes
CREATE INDEX IF NOT EXISTS idx_lignes_transfert_transfert ON lignes_transfert(transfert_id);
CREATE INDEX IF NOT EXISTS idx_lignes_transfert_product ON lignes_transfert(product_id);

-- Inventaires table indexes
CREATE INDEX IF NOT EXISTS idx_inventaires_store_date ON inventaires(store_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_inventaires_status ON inventaires(status);
CREATE INDEX IF NOT EXISTS idx_inventaires_numero ON inventaires(numero);

-- Lignes Inventaire table indexes
CREATE INDEX IF NOT EXISTS idx_lignes_inventaire_inventaire ON lignes_inventaire(inventaire_id);
CREATE INDEX IF NOT EXISTS idx_lignes_inventaire_product ON lignes_inventaire(product_id);

-- Pertes table indexes
CREATE INDEX IF NOT EXISTS idx_pertes_store_date ON pertes(store_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_pertes_product_date ON pertes(product_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_pertes_categorie ON pertes(categorie_id);

-- Suppliers table indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stock_movements_store_product_date ON stock_movements(store_id, product_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_levels_store_low_stock ON stock_levels(store_id, available_quantity) WHERE available_quantity < 10;

-- Partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_bons_reception_draft ON bons_reception(store_id, date_reception DESC) WHERE status = 'draft';
CREATE INDEX IF NOT EXISTS idx_transferts_en_transit ON transferts_stock(store_destination_id, date_creation DESC) WHERE status = 'en_transit';
CREATE INDEX IF NOT EXISTS idx_inventaires_pending ON inventaires(store_id, date DESC) WHERE status = 'en_attente_validation';

-- Materialized view for stock summary (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS stock_summary AS
SELECT 
  s.id as store_id,
  s.name as store_name,
  p.id as product_id,
  p.name as product_name,
  p.category,
  sl.quantity,
  sl.available_quantity,
  sl.reserved_quantity,
  p.current_price,
  (sl.quantity * p.current_price) as stock_value,
  sl.last_updated
FROM stock_levels sl
JOIN stores s ON sl.store_id = s.id
JOIN products p ON sl.product_id = p.id
WHERE sl.quantity > 0 AND s.is_active = true AND p.is_active = true;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_stock_summary_store ON stock_summary(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_summary_product ON stock_summary(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_summary_category ON stock_summary(category);
CREATE INDEX IF NOT EXISTS idx_stock_summary_low_stock ON stock_summary(available_quantity) WHERE available_quantity < 10;

-- Function to refresh stock summary
CREATE OR REPLACE FUNCTION refresh_stock_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY stock_summary;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh stock summary on stock level changes
CREATE OR REPLACE FUNCTION trigger_refresh_stock_summary()
RETURNS trigger AS $$
BEGIN
  -- Schedule a refresh (in a real implementation, this would be done asynchronously)
  PERFORM refresh_stock_summary();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (commented out to avoid performance issues in development)
-- CREATE TRIGGER stock_levels_refresh_summary
--   AFTER INSERT OR UPDATE OR DELETE ON stock_levels
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION trigger_refresh_stock_summary();

-- Performance monitoring views
CREATE OR REPLACE VIEW slow_stock_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%stock%' OR query LIKE '%inventory%' OR query LIKE '%transfer%'
ORDER BY mean_time DESC;

COMMENT ON VIEW slow_stock_queries IS 'Monitor slow stock-related queries for optimization';