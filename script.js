let allPokemon = [];
let currentOffset = 0;
let isLoading = false;
let currentIndex = 0;

async function loadPokemon() {
  if (isLoading === true) return;
  toggleLoading(true);

  let url =
    "https://pokeapi.co/api/v2/pokemon?limit=20&offset=" + currentOffset;
  let res = await fetch(url);
  let data = await res.json();

  await fetchBatch(data.results);
  currentOffset += 20;
  renderList(allPokemon);
  toggleLoading(false);
}

async function fetchBatch(results) {
  for (let i = 0; i < results.length; i++) {
    let res = await fetch(results[i].url);
    let pokemon = await res.json();
    allPokemon.push(pokemon);
  }
}

function renderList(arrayToRender) {
  let list = document.getElementById("pokemon-list");
  let html = "";

  for (let i = 0; i < arrayToRender.length; i++) {
    let p = arrayToRender[i];
    let actualIndex = allPokemon.indexOf(p);
    html += getCardHTML(p, actualIndex);
  }

  list.innerHTML = html;
}

function getCardHTML(p, index) {
  let type = p.types[0].type.name;
  let bg = getTypeColor(type);

  let html = '<li class="card-item" style="background-color: ' + bg + '">';
  html +=
    '<button class="card-btn" data-id="card" aria-label="' +
    p.name +
    '" onclick="openDialog(' +
    index +
    ')">';
  html += "<span>#" + p.id + " " + p.name.toUpperCase() + "</span>";
  html +=
    '<img data-id="card-image" src="' +
    p.sprites.front_default +
    '" alt="' +
    p.name +
    '">';
  html += "<span>" + type + "</span>";
  html += "</button></li>";

  return html;
}

function getTypeColor(type) {
  if (type === "fire") return "#F08030";
  if (type === "water") return "#6890F0";
  if (type === "grass") return "#78C850";
  if (type === "bug") return "#A8B820";
  if (type === "normal") return "#A8A878";
  if (type === "poison") return "#A040A0";
  if (type === "electric") return "#F8D030";
  return "#999999";
}

function openDialog(index) {
  currentIndex = index;
  let p = allPokemon[index];
  let content = document.getElementById("dialog-content");

  content.innerHTML = getDialogHTML(p);
  document.getElementById("pokedex-dialog").showModal();
  document.body.classList.add("no-scroll");

  loadSecondaryData(index);
}

function closeDialog() {
  document.getElementById("pokedex-dialog").close();
  document.body.classList.remove("no-scroll");
}

function getDialogHTML(p) {
  let bg = getTypeColor(p.types[0].type.name);

  let html =
    '<div data-id="overlay-pokemon-name" class="overlay-content" style="background-color: ' +
    bg +
    '">';
  html += "<h2>" + p.name.toUpperCase() + "</h2>";
  html +=
    '<img data-id="dialog-image" src="' +
    p.sprites.front_default +
    '" alt="' +
    p.name +
    '">';
  html +=
    "<p>Height: " + p.height / 10 + "m | Weight: " + p.weight / 10 + "kg</p>";
  html += '<div id="lazy-data">Loading extra data...</div>';
  html += "</div>";

  return html;
}

async function loadSecondaryData(index) {
  let p = allPokemon[index];
  let container = document.getElementById("lazy-data");

  if (p.cachedHappiness) {
    container.innerHTML = "Base Happiness: " + p.cachedHappiness;
    return;
  }

  let res = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + p.id);
  let data = await res.json();

  p.cachedHappiness = data.base_happiness;
  container.innerHTML = "Base Happiness: " + p.cachedHappiness;
}

function nextPokemon() {
  if (currentIndex < allPokemon.length - 1) {
    openDialog(currentIndex + 1);
  }
}

function prevPokemon() {
  if (currentIndex > 0) {
    openDialog(currentIndex - 1);
  }
}

function searchPokemon() {
  let input = document.getElementById("searchInput").value.toLowerCase();
  if (input.length < 3) return renderList(allPokemon);

  let foundItems = [];
  for (let i = 0; i < allPokemon.length; i++) {
    if (allPokemon[i].name.includes(input)) foundItems.push(allPokemon[i]);
  }

  if (foundItems.length === 0) {
    document.getElementById("pokemon-list").innerHTML =
      '<p data-id="not-found">No match found.</p>';
  } else {
    renderList(foundItems);
  }
}

function toggleLoading(show) {
  isLoading = show;
  let btn = document.getElementById("loadBtn");
  let screen = document.getElementById("loading-screen");

  btn.disabled = show;
  if (show === true) {
    screen.style.display = "flex";
  } else {
    screen.style.display = "none";
  }
}

document
  .getElementById("pokedex-dialog")
  .addEventListener("click", function (event) {
    if (event.target === this) {
      closeDialog();
    }
  });

loadPokemon();
