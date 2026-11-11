-- Keep one row per brand + size before adding the unique constraint.
DELETE FROM "products" a
USING "products" b
WHERE a.id > b.id
  AND a.brand = b.brand
  AND a.size = b.size;

CREATE UNIQUE INDEX "products_brand_size_key" ON "products"("brand", "size");
