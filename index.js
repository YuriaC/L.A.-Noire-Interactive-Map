const map = L.map('map').setView([51.505, -0.09], 13);  // map instance

// map tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const marker = L.marker([51.5, -0.09]).addTo(map);
const pins = L.layerGroup()  // create a layer group

const coords = [
  [51.51, -0.09], [51.52, -0.09], [51.53, -0.09],
  [51.54, -0.09], [51.55, -0.09]
]


coords.forEach((coord) => {
  let pin = L.marker(coord)
  .bindTooltip(coord.toString())
  .addTo(map);
  pins.addLayer(pin);
})


console.log(pins.length);  // debug

const legendBin = document.getElementById('bin');
// legendBin.innerHTML = pins.map((pin)=> {
//     const link = document.createElement('a');
//     link.innerHTML = pin;
//   })


// event binding
const popup = L.popup();

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent(''+ e.latlng.toString())
    .openOn(map);
}


function addPin(e) {
  const pin = L.marker();
  pin
    .setLatLng(e.latlng)
    .addTo(map)
    .bindTooltip(e.latlng.toString())

  pin.on('click', () => {
    pin.remove()
  })
}

map.on('click', addPin)