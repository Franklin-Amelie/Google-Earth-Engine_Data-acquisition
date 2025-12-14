/* Bedingungen Dateien: 
1) Zeitraum (Time of Interest): 01-02-2017 bis 31-12-2025 (DD-MM-YYYY)
2) Sentinel-2 (atmosphärisch korrigiert, also L2A) 
3) nur relevante Kanäle bzw relevante Vegetationsindizes
3.1) SAVI, NDMI, NDVI (B4, B8, B11)
3.2) B4, B5 (red edge), B6, B7, B8, B8A, B11 (möglicherweise RGB)
4) Definierte AOI (orthogonales Polygon) - Krib Gare Forest, Tunesien
5) Wolkenbedeckung unter 30%
*/

// ==============================
// 1) AOI (dein gezeichnetes Polygon)
// ==============================
var aoi = geometry;

// ==============================
// 2) Sentinel-2 Collection
// ==============================
var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi)
  .filterDate('2017-02-01', '2025-11-30')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .select(['B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11']);

// ==============================
// 3) Nur die ersten 2 Bilder
// ==============================
var firstTwo = s2.limit(2);

// Zur Kontrolle
print('Anzahl Bilder (Export):', firstTwo.size());
print('Bilder:', firstTwo);

// ==============================
// 4) Export-Schleife (nur 2 Tasks!)
// ==============================
var list = firstTwo.toList(2);

for (var i = 0; i < 2; i++) {
  var img = ee.Image(list.get(i));

  Export.image.toDrive({
    image: img,
    description: 'S2_Image_' + i,
    folder: 'GEE_Sentinel2',
    region: aoi,
    scale: 10,
    crs: 'EPSG:32632',
    maxPixels: 1e13
  });
}
