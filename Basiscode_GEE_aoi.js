var aoi = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[9.125298409218523, 36.242350225086824],
          [9.125298409218523, 36.20523710301688],
          [9.221428780312273, 36.20523710301688],
          [9.221428780312273, 36.242350225086824]]], null, false);


// --- Sentinel-2 ImageCollection // Jahr-Monat-Tag
var s2 = ee.ImageCollection("COPERNICUS/S2_SR")
  .filterBounds(aoi)
  .filterDate("2017-02-03", "2025-12-31")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 40));

// Wöchentliche Intervalle erzeugen
var weeks = ee.List.sequence(0, 52*8 - 1).map(function(i) {
  var start = ee.Date('2017-02-03').advance(i, 'week');
  var end   = start.advance(1, 'week');

  var weekly = s2.filterDate(start, end).median()
                 .set('week', i)
                 .set('date_start', start)
                 .set('date_end', end);

  return weekly;
});

// In Bildkollektion umwandeln
var weeklyCollection = ee.ImageCollection.fromImages(weeks);

// Karte anzeigen
Map.centerObject(aoi, 10);
Map.addLayer(weeklyCollection.first(), {bands:['B4','B3','B2'], min:0, max:3000}, "Week 1");

// Anzahl der Wochen
print('Weekly images:', weeklyCollection.size());



// Download Einzelbild

var img = weeklyCollection.filter(ee.Filter.eq('week', 0)).first();
Export.image.toDrive({
     image: img,
     description: 'sentinel_week0',
     folder: 'GEE_exports',
     fileNamePrefix: 'week0',
     region: aoi, 
     scale: 10, 
     maxPixels: 1e13
});

// wird Fehlermeldung ausgeben: Error: Can't get band number 0. Image has no bands. (Error code: 3
// --> das exportierte Bild ist also leer --> 
// Abgleich von S2 Daten im Copernicus Browser - ganzer Januar 2017 unbrauchbar, weil Bewölkung zu stark. 
// S2 B wurde erst am 7. März 2017, dh bis dahin haben wir eine Revisit Time von zehn Tagen (erst ab Launch Revisit TIme von fünf Tagen)
// Update: auch nach Änderung des Codes (Zeitraum angepasst und in Copernicus abgeglichen), erschient dieselbe Fehlermeldung