const pokedex = document.getElementById('pokedex');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('search');
const modal = document.getElementById('pokemon-modal');
const details = document.getElementById('pokemon-details');
const closeBtn = document.getElementById('close-btn');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('page-info');
const modalContent = document.querySelector('.modal-content');

let currentPage = 1;
const limit = 20;
let totalPokemon = 0;

const typeColors = {
  fire: '#F08030',
  grass: '#78C850',
  electric: '#F8D030',
  water: '#6890F0',
  ground: '#E0C068',
  rock: '#B8A038',
  fairy: '#EE99AC',
  poison: '#A040A0',
  bug: '#A8B820',
  dragon: '#7038F8',
  psychic: '#F85888',
  flying: '#A890F0',
  fighting: '#C03028',
  normal: '#A8A878',
  ice: '#98D8D8',
  ghost: '#705898',
  dark: '#705848',
  steel: '#B8B8D0'
};

const statIcons = {
  hp: '❤️',
  attack: '🗡️',
  defense: '🛡️',
  'special-attack': '🧠',
  'special-defense': '🛡️‍🧬',
  speed: '🏃'
};

const abilityIcon = '🎯';
const typeIcon = '🏷️';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const hexToRGBA = (hex, alpha = 1) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const fetchPokemonList = async (page = 1) => {
  const offset = (page - 1) * limit;
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  showLoader();
  try {
    const res = await fetch(url);
    const data = await res.json();
    totalPokemon = data.count;
    const pokemonResults = data.results;
    pokedex.innerHTML = '';
    await Promise.all(pokemonResults.map(p => fetchPokemonData(p.url)));
  } catch (error) {
    console.error('Failed to fetch Pokémon list:', error);
    pokedex.innerHTML = `<p>Error loading Pokémon. Please try again later.</p>`;
  }
  hideLoader();
};

const fetchPokemonData = async (url) => {
  try {
    const res = await fetch(url);
    const pokemon = await res.json();
    createPokemonCard(pokemon);
  } catch (error) {
    console.error('Failed to fetch Pokémon data:', error);
  }
};

const createPokemonCard = (pokemon) => {
  const card = document.createElement('div');
  card.classList.add('card');

  const primaryType = pokemon.types[0].type.name;
  const bgColor = typeColors[primaryType] || '#F5F5F5';
  card.style.background = bgColor;

  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = `
      0 0 15px rgba(255, 255, 255, 0.6),
      0 0 20px ${hexToRGBA(bgColor, 0.8)}
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  });

  const typeBadges = pokemon.types.map(t => `
    <span class="type-badge">${capitalize(t.type.name)}</span>
  `).join('');

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" style="width:80px; height:80px;">
    <h3 style="font-size:16px;">${capitalize(pokemon.name)}</h3>
    <div class="type-badges">${typeBadges}</div>
  `;

  card.addEventListener('click', () => showPokemonDetails(pokemon));

  pokedex.appendChild(card);

  // Animate appearance
  setTimeout(() => {
    card.classList.add('show');
  }, 100);
};

const showPokemonDetails = (pokemon) => {
  const primaryType = pokemon.types[0].type.name;
  const modalColor = typeColors[primaryType] || '#ffffff';
  modalContent.style.background = modalColor;

  details.innerHTML = `
    <h2>${capitalize(pokemon.name)}</h2>
    <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" style="width:150px;">
    <h3>Stats:</h3>
    <div style="text-align:left; display:flex; flex-direction:column; gap:5px;">
      ${pokemon.stats.map(stat => `
        <div>
          ${statIcons[stat.stat.name] || '📊'} <strong>${capitalize(stat.stat.name)}:</strong> ${stat.base_stat}
        </div>
      `).join('')}
    </div>

    <h3>Abilities:</h3>
    <div style="text-align:left; display:flex; flex-direction:column; gap:5px;">
      ${pokemon.abilities.map(ab => `
        <div>
          ${abilityIcon} <strong>${capitalize(ab.ability.name)}</strong>
        </div>
      `).join('')}
    </div>

    <h3>Type(s):</h3>
    <div style="text-align:left; display:flex; flex-direction:column; gap:5px;">
      ${pokemon.types.map(t => `
        <div>
          ${typeIcon} <strong>${capitalize(t.type.name)}</strong>
        </div>
      `).join('')}
    </div>
  `;
  modal.classList.remove('hidden');
};

closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});



// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

const showLoader = () => loader.classList.remove('hidden');
const hideLoader = () => loader.classList.add('hidden');

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPokemonList(currentPage);
    updatePageInfo();
  }
});

nextBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(totalPokemon / limit);
  if (currentPage < totalPages) {
    currentPage++;
    fetchPokemonList(currentPage);
    updatePageInfo();
  }
});

const updatePageInfo = () => {
  pageInfo.textContent = `Page ${currentPage}`;
  prevBtn.disabled = currentPage === 1;
};

searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  if (query === '') {
    fetchPokemonList(currentPage);
  } else {
    const url = `https://pokeapi.co/api/v2/pokemon/${query}`;
    showLoader();
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Not found');
      const pokemon = await res.json();
      pokedex.innerHTML = '';
      createPokemonCard(pokemon);
    } catch (error) {
      pokedex.innerHTML = `<p style="text-align:center;">No Pokémon found!</p>`;
      console.error('Search error:', error);
    }
    hideLoader();
  }
});

// Initial load
fetchPokemonList(currentPage);
