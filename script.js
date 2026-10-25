const API_LIST = "https://pokeapi.co/api/v2/pokemon?limit=30&offset=0";

const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("searchInput");
const overlay = document.getElementById("modalOverlay");
const closeBtn = document.getElementById("modalClose");
const paneMain = document.getElementById("pane-main");
const paneStats = document.getElementById("pane-stats");
const paneEvo = document.getElementById("pane-evo");

let pokemonCache = {};

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function calcBST(statsArray) {
  let total = 0;
  for (let i = 0; i < statsArray.length; i++) {
    total += statsArray[i].base_stat;
  }
  return total;
}

async function fetchPokemonImageByName(name) {
  let res = await fetch(
    "https://pokeapi.co/api/v2/pokemon/" + name.toLowerCase(),
  );
  let d = await res.json();
  return d.sprites.front_default;
}

async function fetchEvolutionChainNames(pokemonId) {
  let speciesRes = await fetch(
    "https://pokeapi.co/api/v2/pokemon-species/" + pokemonId,
  );
  let species = await speciesRes.json();

  if (!species.evolution_chain) {
    return [];
  }

  let evoRes = await fetch(species.evolution_chain.url);
  let evoData = await evoRes.json();

  let names = [];
  let node = evoData.chain;

  while (node != null) {
    names.push(cap(node.species.name));
    if (node.evolves_to && node.evolves_to.length > 0) {
      node = node.evolves_to[0];
    } else {
      node = null;
    }
  }

  return names;
}

async function createPokemon(pokemonUrl) {
  let res = await fetch(pokemonUrl);
  let d = await res.json();

  let bst = calcBST(d.stats);

  let typesArray = [];
  for (let i = 0; i < d.types.length; i++) {
    typesArray.push(d.types[i].type.name);
  }

  let p = {
    id: d.id,
    name: cap(d.name),
    types: typesArray,
    height: d.height,
    weight: d.weight,
    image: d.sprites.front_default,
    bst: bst,
    stats: d.stats,
  };

  return p;
}

async function loadPokemon() {
  container.innerHTML = "Lade Daten...";

  let res = await fetch(API_LIST);
  let data = await res.json();
  let basics = data.results;

  container.innerHTML = "";

  for (let i = 0; i < basics.length; i++) {
    let p = await createPokemon(basics[i].url);

    pokemonCache[p.id] = p;

    let html =
      '<article class="card" tabindex="0" onclick="showDetails(' +
      p.id +
      ")\" onkeydown=\"if(event.key === 'Enter') showDetails(" +
      p.id +
      ')">';
    html += '<div class="card-head">';
    html += "<span>#" + p.id + " " + p.name + "</span>";
    html += '<span class="bst">BST ' + p.bst + "</span>";
    html += "</div>";
    html += '<img class="sprite" src="' + p.image + '" alt="' + p.name + '">';
    html += "</article>";

    container.innerHTML += html;
  }
}

async function showDetails(pokemonId) {
  let p = pokemonCache[pokemonId];
  if (!p) return;

  document.getElementById("modalPid").innerText = "#" + p.id;
  document.getElementById("modalName").innerText = p.name;
  document.getElementById("modalImg").src = p.image;

  let mainHtml =
    '<div class="kv"><strong>Grösse:</strong> ' + p.height / 10 + " m</div>";
  mainHtml +=
    '<div class="kv"><strong>Gewicht:</strong> ' + p.weight / 10 + " kg</div>";
  mainHtml +=
    '<div class="kv"><strong>Typen:</strong> ' + p.types.join(", ") + "</div>";
  paneMain.innerHTML = mainHtml;

  let statsHtml = "";
  for (let i = 0; i < p.stats.length; i++) {
    let s = p.stats[i];
    statsHtml +=
      '<div class="kv"><strong>' +
      cap(s.stat.name) +
      ":</strong> " +
      s.base_stat +
      "</div>";
  }
  paneStats.innerHTML = statsHtml;

  paneEvo.innerHTML = "Lade Entwicklungen...";
  let chainNames = await fetchEvolutionChainNames(p.id);

  if (chainNames.length === 0) {
    paneEvo.innerHTML = "Keine Daten";
  } else {
    let evoHTML = '<div class="evo-row">';

    for (let i = 0; i < chainNames.length; i++) {
      let stageName = chainNames[i];
      let img = await fetchPokemonImageByName(stageName);

      if (i > 0) {
        evoHTML += '<div class="evo-arrow">»</div>';
      }

      evoHTML += '<div class="evo-stage">';
      if (img) {
        evoHTML +=
          '<img class="evo-img" src="' + img + '" alt="' + stageName + '">';
      }
      evoHTML += '<div class="evo-name">' + stageName + "</div>";
      evoHTML += "</div>";
    }
    evoHTML += "</div>";
    paneEvo.innerHTML = evoHTML;
  }

  let allTabs = document.querySelectorAll(".tab");
  for (let i = 0; i < allTabs.length; i++) {
    allTabs[i].classList.remove("active");
  }

  let allPanes = document.querySelectorAll(".pane");
  for (let j = 0; j < allPanes.length; j++) {
    allPanes[j].classList.remove("active");
  }

  allTabs[0].classList.add("active");
  document.getElementById("pane-main").classList.add("active");

  overlay.classList.remove("hidden");
}

closeBtn.addEventListener("click", function () {
  overlay.classList.add("hidden");
});

let tabButtons = document.querySelectorAll(".tab");
for (let i = 0; i < tabButtons.length; i++) {
  tabButtons[i].addEventListener("click", function () {
    for (let j = 0; j < tabButtons.length; j++) {
      tabButtons[j].classList.remove("active");
    }
    let allPanes = document.querySelectorAll(".pane");
    for (let k = 0; k < allPanes.length; k++) {
      allPanes[k].classList.remove("active");
    }

    this.classList.add("active");
    let target = this.getAttribute("data-tab");
    document.getElementById("pane-" + target).classList.add("active");
  });
}

searchInput.addEventListener("input", function () {
  let q = searchInput.value.trim().toLowerCase();
  let html = "";

  let keys = Object.keys(pokemonCache);
  for (let i = 0; i < keys.length; i++) {
    let p = pokemonCache[keys[i]];

    if (q === "" || p.name.toLowerCase().includes(q)) {
      html +=
        '<article class="card" tabindex="0" onclick="showDetails(' +
        p.id +
        ")\" onkeydown=\"if(event.key === 'Enter') showDetails(" +
        p.id +
        ')">';
      html += '<div class="card-head">';
      html += "<span>#" + p.id + " " + p.name + "</span>";
      html += '<span class="bst">BST ' + p.bst + "</span>";
      html += "</div>";
      html += '<img class="sprite" src="' + p.image + '" alt="' + p.name + '">';
      html += "</article>";
    }
  }

  container.innerHTML = html;
});

loadPokemon();
