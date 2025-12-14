// ==============================
// 1) AOI
// ==============================
// Dein im Editor gezeichnetes Polygon heißt standardmäßig "geometry"
var aoi = geometry;

// Karte
Map.centerObject(aoi, 9);
Map.addLayer(aoi, {}, 'AOI');


// ==============================
// 2) Sentinel-2 Collection
// ==============================
var s2 = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(aoi)
  .filterDate('2017-02-01', '2025-11-30')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

print('Anzahl gültiger Bilder:', s2.size());


// ==============================
// 3) Bilder auf AOI clippen
// ==============================
var s2_clipped = s2.map(function(img) {
  return img.clip(aoi);
});


// ==============================
// 4) Erstes Bild anzeigen
// ==============================
var firstImage = ee.Image(s2_clipped.first());

Map.addLayer(
  firstImage,
  {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000},
  'Erstes Bild RGB'
);


// ==============================
// 5) Test-Export: erstes Bild
// ==============================
Export.image.toDrive({
  image: firstImage.select(['B2','B3','B4','B8','B11']),
  description: 'S2_first_image_test',
  folder: 'GEE_Sentinel2',
  region: aoi,
  scale: 10,
  maxPixels: 1e13
});


// funktioniert, hat aber nur fünf Kanäle