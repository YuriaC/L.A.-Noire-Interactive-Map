// global constants
const imgUrl = './asset/LAN_map.jpg';
const dataUrl = './data/coords.json';  // path to coords.json
const iconUrl = './asset/icons/';  // path to icons
const legendBin = document.getElementById('bin');  // get html element of the layer controller

// setUp marker icons
const filmReelIcon = L.icon({
  iconUrl: `${iconUrl}filmReel_icon.svg`,
  iconSize: [20, 20],
})

const shieldIcon = L.icon({
  iconUrl: `${iconUrl}shield_icon.svg`,
  iconSize: [20, 20]
})

const landmarkIcon = L.icon({
  iconUrl: `${iconUrl}landmark_icon.svg`,
  iconSize: [25, 25]
})

const customIcon = L.icon({
  iconUrl: `${iconUrl}pin4.svg`,
  iconSize: [20, 30]
})

function buildMap() {
  // map img properties
  const errorOverlayUrl = 'https://cdn-icons-png.flaticon.com/512/110/110686.png';
  const altText = 'map of L.A. noire';
  const width = 4600; // pixels
  const height = 3580; // pixels
  const imgBounds = [[height, 0], [0, width]];

  // map layer initialization
  const map = L.map('map', {
    crs: L.CRS.Simple, // Use simple coordinate reference system
    minZoom: -3,
    maxZoom: 3,
    maxBounds: L.latLngBounds(L.latLng(height, 0), L.latLng(0, width)),
    zoomControl: false,
  })

  // setting img overlay on the map layer
  L.imageOverlay(imgUrl, imgBounds, {
    errorOverlayUrl: errorOverlayUrl,
    alt: altText,
    interactive: true
  }
  ).addTo(map);

  // overlap img overlay with map layer
  map.fitBounds(imgBounds).setView(L.latLng(1302.360034, 3665.490778), -2);

  L.control.zoom({position: "topright"}).addTo(map);

  return map;
}

function createMarkerCheckbox(bin, text, id, className, checkBool = true) {
  const checkboxEle = document.createElement('input');
  const spanEle = document.createElement('span');
  checkboxEle.type = "checkbox";
  checkboxEle.id = id;
  checkboxEle.className = className;
  checkboxEle.checked = checkBool;

  spanEle.textContent = text;
  bin.appendChild(checkboxEle);
  bin.appendChild(spanEle);

  return checkboxEle;
}

function markerEventCoupler(checkBox, marker, map) {
  checkBox.addEventListener("change", function () {
    if(this.checked) {
      marker.checked = true;
      map.addLayer(marker);
    } else {
      marker.checked = false;
      map.removeLayer(marker);
    }
  })
}

function dataTypeSieve(type) {
  let iconType = null;
  let groupName = "";
  switch(type) {
    case "film reel":
      iconType = filmReelIcon;
      groupName = `film-reel`;
      break;
    case "shield":
      iconType = shieldIcon;
      groupName = "shield";
      break;
    case "landmark":
      iconType = landmarkIcon;
      groupName = "landmark";
      break;
    case "misc":
      // add icon for other type coord
      iconType = customIcon;
      groupName = "misc";
      break;
    default:
      console.log('default type detected.')
  }

  return [iconType, groupName];
}

function getPopupBtn(marker, counter) {
  const collectBtn = document.createElement('button');
  collectBtn.className = 'popup-btn';
  collectBtn.id = `popupBtn-${counter}`;
  if (marker.taken) {
    collectBtn.innerText = 'Mark as Missing';
  } else {
    collectBtn.innerText = 'Mark as Collected';
  }

  collectBtn.addEventListener('click', () => {
    const changeEvent = new Event("change", {bubbles: true})
    let htmlEle = document.getElementById(marker.htmlId);
    marker.taken = !marker.taken;
    htmlEle.checked = false;
    htmlEle.dispatchEvent(changeEvent);
    if(marker.taken) {
      collectBtn.innerText = 'Mark as Missing';
    } else {
      collectBtn.innerText = 'Mark as Collected';
    }
  })

  return collectBtn
}

function getPopupContent(location, type, counter, marker) {
  let tag = `${type} ${location.id}`;
  let tooltipImgUrl = './asset/ref/' + type + "/" + location.img;
  let title = location.name ?  `<h4>${tag}: ${location.name}</h4>`: `<h4>${tag}:</h4>`;
  let content = location.desc ? location.desc : '';
  let btn = getPopupBtn(marker, counter);
  let embedText = location.img ? 
    `${title} ${content} <img class="detailedImg" src="${tooltipImgUrl}"/> <br/>` 
    : `${title} ${content}`;
  const popupBin = document.createElement('div');
  popupBin.className = "marker-popup";
  popupBin.innerHTML = embedText;
  popupBin.appendChild(btn);
  return popupBin;
}

function createIconEle(bin, url) {
  const iconEle = document.createElement("img");
  const iconUrl = `${url}collapse_icon.svg`;
  iconEle.alt = 'collapse icon';
  iconEle.src = iconUrl;
  iconEle.className = 'collapsible-icon'
  bin.appendChild(iconEle);
}

// function for add markers
function addMarker(locations, type, counter, titleBin, bin, map) {
  [iconType, groupName] = dataTypeSieve(type);
  const markerGroup = [];
  titleText = `${type}s (${locations.length})`;
  createMarkerCheckbox(titleBin, titleText, groupName, "titleCheckbox marker-toggler");
  createIconEle(titleBin, iconUrl);
  
  locations.forEach((location) => {
    let tag = `${type} ${location.id}`;
    counter++;
    let marker = null;
    if(iconType) {
      marker = L.marker(
        location.coord,
        {icon: iconType}
      ).bindTooltip(`${tag}, click for details`, {
        direction: 'top',
        offset: [0, -10],
        opacity: 1,
        className: 'markerTooltip',
      })
    } else {
      marker = L.marker(
        location.coord,
      )
      .bindTooltip(`${tag} click for details`, {
        direction: 'top',
        offset: [0, -10],
        opacity: 1,
        className: 'markerTooltip',
      })

    }
    marker.htmlId = counter;
    if(!location.taken) {
      marker.checked = true;
      marker.taken = false;
      map.addLayer(marker);
    } else {
      marker.checked = false;
      marker.taken = true;
    }

    const popupEle = getPopupContent(location, type, counter, marker);
    marker.bindPopup(popupEle)

    const container = document.createElement('div');
    container.className = 'markerContainer';
    checkBoxClassName = `${groupName}-toggler marker-toggler`;    
    const checkBox = createMarkerCheckbox(container, tag, counter, checkBoxClassName, marker.checked); 
    markerEventCoupler(checkBox, marker, map);
    bin.appendChild(container);
    markerGroup.push(marker);
  })

  return markerGroup;
}

function groupMarkerBinder(groupName) {
  // const ele = document.getElementById(groupName);
  const ele = document.getElementById(groupName).firstElementChild;

  ele.addEventListener("change", (e) => {
    if (e.target.className.includes('titleCheckbox') || e.target.id === 'markerController') {
      const workers = document.querySelectorAll(`.${groupName}-toggler`);
      workers.forEach((worker) => {
        worker.checked = e.target.checked;
        worker.dispatchEvent(new Event('change', { bubbles: true }));
      })
    }
  })
}

async function fetchData(map) {
  try {
    const res = await fetch(dataUrl);
    const jsonData = await res.json();
    console.log('Data loaded!');  // INFO

    const allMarkers = [];
    const allMarkerBin = document.createElement('div');
    allMarkerBin.id = "marker";
    createMarkerCheckbox(allMarkerBin, "All Marker", "markerController", "markerController");
    legendBin.appendChild(allMarkerBin);

    let counter = 0;
    jsonData.forEach((record) => {
      const typeName = dataTypeSieve(record.type)[1];
      // DOM manipulation
      const recordBin = document.createElement('div');
      recordBin.id = typeName; 
      const titleEle = document.createElement('div');
      titleEle.className = 'collapsible-header';
      const detailEle = document.createElement('div');
      detailEle.className = 'collapsible-content';
      recordBin.appendChild(titleEle);
      recordBin.appendChild(detailEle);
      legendBin.appendChild(recordBin);

      let res = addMarker(record['record'], record['type'], counter, titleEle, detailEle, map);
      counter += (record['record'].length + 1);
      groupMarkerBinder(typeName);
      allMarkers.push(...res);
    })
    
    groupMarkerBinder("marker");

    return allMarkers;

  } catch(err) {
    console.error('Error ', err);
    return {type: 'err', data: err};
  }
}

// events 
// collapsible
function toggleCollapse(source, applicant, displayVal) {
  const collapseIcon = `${iconUrl}collapse_icon.svg`;
  const expandIcon = `${iconUrl}expand_icon.svg`;
  
  let displayed = null;
  if(displayVal === 'none') {
    displayed = false;
  } else {
    displayed = true;
  }

  source.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === 'input') return;
    if(displayed) {
      applicant.style.display = "none";
      source.lastElementChild.src = expandIcon;
    } else {
      applicant.style.display = "block";
      source.lastElementChild.src = collapseIcon;
    }  
    displayed = !displayed;
  })
}

function collapsibleControl() {
  const collapsibleTitles = document.querySelectorAll('.collapsible-header');
  collapsibleTitles.forEach((title) => {
    const sibling = title.nextElementSibling
    const displayCheck = getComputedStyle(sibling).display
    toggleCollapse(title, sibling, displayCheck);  
  })
}

function filterUncollectedMarker(arr) {
  const filteredArr = arr.filter((ele) => {
    if(ele.hasOwnProperty("checked") && ele.checked) {return ele}
  })
  return filteredArr;
}

function addCustomControl(arr, map) {
  // add custom control
  L.Control.Collection = L.Control.extend({
      onAdd: function() {
        const globalToggle = document.getElementById('markerController');           
        let controlBin = L.DomUtil.create('div', 'control-bin');
        let clearBtn = L.DomUtil.create('a', 'custom-control', controlBin);
        clearBtn.role = "button";
        clearBtn.ariaLabel = 'Hide All Markers'
        clearBtn.title ="Hide All Markers";
        clearBtn.id = globalToggle.checked;
        let clearImg = L.DomUtil.create('img', 'control-icon', clearBtn);
        clearImg.src = `${iconUrl}see.svg`;
        clearImg.style.width = "75%";
        
        let starBtn = L.DomUtil.create('a', 'custom-control', controlBin);
        starBtn.role = "button";
        starBtn.ariaLabel = 'Show Collectables'
        starBtn.title = 'Show Collectables';
        starBtn.id = 'false';
        let btnImg = L.DomUtil.create('img', 'control-icon', starBtn);
        btnImg.src = `${iconUrl}star.svg`;
        const changeEvent = new Event('change', {bubbles: true});

        L.DomEvent
          .addListener(controlBin, "click", L.DomEvent.stopPropagation)
          .addListener(controlBin, "dblclick", L.DomEvent.stopPropagation)
          .addListener(clearBtn, "click", function() {
            if (clearBtn.id === 'true') {
              clearImg.src = `${iconUrl}unsee.svg`;
              globalToggle.checked = false;
              clearBtn.title = "Show All Markers"
              globalToggle.dispatchEvent(changeEvent);
            } else {
              clearImg.src = `${iconUrl}see.svg`;
              globalToggle.checked = true;
              clearBtn.title = "Hide All Markers"
              globalToggle.dispatchEvent(changeEvent);
            }
            clearBtn.id = clearBtn.id === 'false' ? "true" : "false";
          })   
          .addListener(starBtn, "click", function() {
            if(starBtn.id === 'false') {
              btnImg.src = `${iconUrl}coloredStar.svg`;
              globalToggle.checked = false;
              starBtn.title = "Show All Markers"
              globalToggle.dispatchEvent(changeEvent);
              arr.forEach((ele) => {
                let htmlEle = document.getElementById(ele.htmlId);
                htmlEle.checked = !ele.taken;
                htmlEle.dispatchEvent(changeEvent);
              })
            } else {
              btnImg.src = `${iconUrl}star.svg`;
              starBtn.title = "Show Collectables"
              globalToggle.checked = true;
              globalToggle.dispatchEvent(changeEvent);
            }

            starBtn.id = starBtn.id === 'false' ? "true" : "false";
          })

        return controlBin
      }
  });

  L.control.collection = function(opts) {
    return new L.Control.Collection(opts);
  }
  L.control.collection({position: 'topright'}).addTo(map);
}

async function main() {
  const map = buildMap();
  const allMarkers = await fetchData(map);
  console.log("all data loaded and dom established!");
  addCustomControl(allMarkers, map);
  collapsibleControl();  
}

// __MAIN__
main();



