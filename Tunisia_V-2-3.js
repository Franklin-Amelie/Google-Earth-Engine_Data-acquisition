/* Bedingungen Dateien: 
1) Zeitraum (Time of Interest): 01-02-2017 bis 31-12-2025 (DD-MM-YYYY) --- TRUE
2) Sentinel-2 (atmosphärisch korrigiert, also L2A) --- TRUE
3) nur relevante Kanäle bzw relevante Vegetationsindizes 
3.1) SAVI, NDMI, NDVI (B4, B8, B11) --- FALSE
3.2) B4, B5 (red edge), B6, B7, B8, B8A, B11 (möglicherweise RGB) --- TRUE
4) Definierte AOI (orthogonales Polygon) - Krib Gare Forest, Tunesien --- TRUE
5) Wolkenbedeckung unter 30% --- TRUE
6) Mehrfachdownload oder gestaffelt nach Jahren --- FALSE
*/

// ==============================
// 1) AOI (dein gezeichnetes Polygon)
// ==============================
var aoi = geometry;

// ==============================
// 2) Sentinel-2 Collection
// ==============================


var addIndices = function(img) {
  var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var ndmi = img.normalizedDifference(['B8', 'B11']).rename('NDMI');

  var savi = img.expression(
    '((NIR - RED) / (NIR + RED + L)) * (1 + L)', {
      'NIR': img.select('B8'),
      'RED': img.select('B4'),
      'L': 0.5
    }).rename('SAVI');

  return img.addBands([ndvi, ndmi, savi]).toFloat();
};



var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi)
  .filterDate('2017-02-01', '2025-11-30')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .select(['B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11'])
  .map(addIndices)
  .toFloat();


// Indizes 
var addIndices = function(img) {
  var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var ndmi = img.normalizedDifference(['B8', 'B11']).rename('NDMI');

  var savi = img.expression(
    '((NIR - RED) / (NIR + RED + L)) * (1 + L)', {
      'NIR': img.select('B8'),
      'RED': img.select('B4'),
      'L': 0.5
    }).rename('SAVI');

  return img.addBands([ndvi, ndmi, savi]).toFloat();
};


print('Anzahl Bilder:', s2.size());
// ==============================
// 3) Nur die ersten 2 Bilder
// ==============================
// var firstTwo = s2.limit(2);

// Zur Kontrolle
print('Anzahl Bilder (Export):', s2.size());
// print('Bilder:', firstTwo);

// ==============================
// 4) Export-Schleife (nur 2 Tasks!)
// ==============================
/* var list = firstTwo.toList(2);

for (var i = 0; i < 2; i++) {
  var img = ee.Image(list.get(i)); */

var years = ee.List.sequence(2017, 2025);


// Export 
years.evaluate(function(yearList) {

  yearList.forEach(function(y) {

    var yearly = s2.filter(ee.Filter.calendarRange(y, y, 'year'));
    var count = yearly.size();

    print('Jahr', y, 'Anzahl Bilder:', count);

    var list = yearly.toList(count);

    count.evaluate(function(n) {

      for (var i = 0; i < n; i++) {
        var img = ee.Image(list.get(i));

        var date = ee.Date(img.get('system:time_start'))
          .format('YYYY-MM-dd')
          .getInfo();

        // --- Multiband-Export (Spektralbänder)
        Export.image.toDrive({
          image: img.select(['B4','B5','B6','B7','B8','B8A','B11']),
          description: 'S2_' + y + '_' + date + '_BANDS',
          folder: 'GEE_S2_' + y,
          region: aoi,
          scale: 10,
          crs: 'EPSG:32632',
          maxPixels: 1e13
        });

        // --- NDVI
        Export.image.toDrive({
          image: img.select('NDVI'),
          description: 'S2_' + y + '_' + date + '_NDVI',
          folder: 'GEE_S2_' + y,
          region: aoi,
          scale: 10,
          crs: 'EPSG:32632',
          maxPixels: 1e13
        });

        // --- NDMI
        Export.image.toDrive({
          image: img.select('NDMI'),
          description: 'S2_' + y + '_' + date + '_NDMI',
          folder: 'GEE_S2_' + y,
          region: aoi,
          scale: 10,
          crs: 'EPSG:32632',
          maxPixels: 1e13
        });

        // --- SAVI
        Export.image.toDrive({
          image: img.select('SAVI'),
          description: 'S2_' + y + '_' + date + '_SAVI',
          folder: 'GEE_S2_' + y,
          region: aoi,
          scale: 10,
          crs: 'EPSG:32632',
          maxPixels: 1e13
        });
      }
    });
  });
});


/* Gesamtbilder: 317
2017: 21 (erst ab Feb)
2018: 35
2019: 35
2020: 41
2021: 35
2022: 40 
2023: 35
2024: 36
2025: 39 (nur bis November) */