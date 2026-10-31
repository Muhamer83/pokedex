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

function getAbilities(abilitiesArr) {
  let result = "";
  for (let i = 0; i < abilitiesArr.length; i++) {
    result += abilitiesArr[i].ability.name;
    if (i < abilitiesArr.length - 1) result += ", ";
  }
  return result;
}

function getDialogHTML(p) {
  let bg = getTypeColor(p.types[0].type.name);
  let ab = getAbilities(p.abilities);
  let html =
    '<div data-id="overlay-pokemon-name" class="overlay-content" style="background-color: ' +
    bg +
    '">';
  html +=
    '<h2 class="dialog-title">#' + p.id + " " + p.name.toUpperCase() + "</h2>";
  html += '<img data-id="dialog-image" src="' + p.sprites.front_default + '">';
  html += '<div class="stats-box">';
  html += '<p><span class="label">Height:</span> ' + p.height / 10 + " m</p>";
  html += '<p><span class="label">Weight:</span> ' + p.weight / 10 + " kg</p>";
  html +=
    '<p><span class="label">Base exp:</span> ' + p.base_experience + "</p>";
  html += '<p><span class="label">Abilities:</span> ' + ab + "</p>";
  html += '<div id="lazy-data"></div><div id="evo-data"></div></div></div>';
  return html;
}

async function loadSecondaryData(index) {
  let p = allPokemon[index];
  if (p.cachedHappiness) {
    document.getElementById("lazy-data").innerHTML = p.cachedHappiness;
    if (p.evoData) return renderEvoChain(p.evoData);
    return;
  }
  let res = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + p.id);
  let data = await res.json();
  p.cachedHappiness =
    "<p><span class='label'>Happiness:</span> " + data.base_happiness + "</p>";
  document.getElementById("lazy-data").innerHTML = p.cachedHappiness;
  loadEvoChain(data.evolution_chain.url, p);
}

async function loadEvoChain(url, p) {
  let res = await fetch(url);
  let data = await res.json();
  p.evoData = data;
  renderEvoChain(data);
}

function renderEvoChain(data) {
  let html = "<div class='evo-box'><span class='label'>Evolution:</span><br>";
  html += getEvoBtn(data.chain.species.name);

  if (data.chain.evolves_to.length > 0) {
    let next1 = data.chain.evolves_to[0];
    html += " ➔ " + getEvoBtn(next1.species.name);

    if (next1.evolves_to.length > 0) {
      html += " ➔ " + getEvoBtn(next1.evolves_to[0].species.name);
    }
  }
  document.getElementById("evo-data").innerHTML = html + "</div>";
}

function getEvoBtn(name) {
  return (
    "<button class='evo-btn' onclick='openEvo(\"" +
    name +
    "\")'>" +
    name +
    "</button>"
  );
}

async function openEvo(name) {
  for (let i = 0; i < allPokemon.length; i++) {
    if (allPokemon[i].name === name) return openDialog(i);
  }

  let res = await fetch("https://pokeapi.co/api/v2/pokemon/" + name);
  let newPokemon = await res.json();
  allPokemon.push(newPokemon);
  renderList(allPokemon);
  openDialog(allPokemon.length - 1);
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
