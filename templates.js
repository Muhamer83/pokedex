function getCardHTML(p, index) {
  let type = p.types[0].type.name;

  return `
    <li class="card-item type-${type}">
      <button class="card-btn" data-id="card" aria-label="${p.name}" onclick="openDialog(${index})">
        <span>#${p.id} ${p.name.toUpperCase()}</span>
        <img data-id="card-image" src="${p.sprites.front_default}" alt="${p.name}">
        <span>${type}</span>
      </button>
    </li>
  `;
}

function getDialogHTML(p) {
  let type = p.types[0].type.name;
  let ab = getAbilities(p.abilities);

  return `
    <div data-id="overlay-pokemon-name" class="overlay-content type-${type}">
      <h2 class="dialog-title">#${p.id} ${p.name.toUpperCase()}</h2>
      <img data-id="dialog-image" src="${p.sprites.front_default}">
      <div class="stats-box">
        <p><span class="label">Height:</span> ${p.height / 10} m</p>
        <p><span class="label">Weight:</span> ${p.weight / 10} kg</p>
        <p><span class="label">Abilities:</span> ${ab}</p>
        <div id="lazy-data"></div>
        <div id="evo-data"></div>
      </div>
    </div>
  `;
}

function getEvoBtn(name) {
  return `<button class="evo-btn" onclick="openEvo('${name}')">${name}</button>`;
}
