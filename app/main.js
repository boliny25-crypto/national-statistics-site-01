// Router and page wiring for China in Numbers.
//
// Hash routes:
//   #/              overview      #/economy    economy (with the GDP/growth toggle)
//   #/population    population    #/living     living standards
//   #/regions       regions       #/explore    the year-slider explorer
//
// Views render static HTML; the interactive pages (economy toggle, regions table, explorer slider)
// get their controls wired here after each render. window.__shotReady follows the usual pattern:
// false while a page renders, true once it — including its controls — is ready on screen.

import { years, populationMillions, gdpTrillion, urbanisationPct, provinces2024, nationalGdp2024 } from './data.js';
import { overviewPage, populationPage, economyPage, economyChart, livingPage, regionsPage, regionRow, explorePage, missingPage } from './views.js';

const app = document.getElementById('app');

const routes = {
  '/': { title: 'China in Numbers — National Statistics Explorer', key: 'overview', page: overviewPage },
  '/population': { title: 'Population | China in Numbers', key: 'population', page: populationPage },
  '/economy': { title: 'Economy | China in Numbers', key: 'economy', page: economyPage, init: initEconomy },
  '/living': { title: 'Living standards | China in Numbers', key: 'living', page: livingPage },
  '/regions': { title: 'Regions | China in Numbers', key: 'regions', page: regionsPage, init: initRegions },
  '/explore': { title: 'Explorer | China in Numbers', key: 'explore', page: explorePage, init: initExplorer },
};

function render() {
  window.__shotReady = false;
  const path = location.hash.replace(/^#/, '') || '/';
  const route = routes[path];
  document.title = route ? route.title : 'Not found | China in Numbers';
  app.innerHTML = route ? route.page() : missingPage();

  // Mark the current page in the navigation.
  document.querySelectorAll('.mainnav a').forEach((a) => {
    const active = route && a.dataset.route === route.key;
    a.classList.toggle('active', Boolean(active));
    if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  if (route && route.init) route.init();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

// --- Economy: swap the chart between total GDP and real growth --------------
function initEconomy() {
  const chartBox = document.getElementById('economy-chart');
  const note = document.getElementById('economy-note');
  const btnGdp = document.getElementById('btn-gdp');
  const btnGrowth = document.getElementById('btn-growth');
  const notes = {
    gdp: 'Current prices. Growth slowed to 2.2% in 2020, rebounded to 8.4% in 2021, and has run at about 5% since 2023.',
    growth: 'Real (inflation-adjusted) growth, percent year on year. The 2020 dip and 2021 rebound mark the pandemic shock and recovery.',
  };
  const show = (mode) => {
    chartBox.innerHTML = economyChart(mode);
    note.textContent = notes[mode];
    btnGdp.classList.toggle('active', mode === 'gdp');
    btnGrowth.classList.toggle('active', mode === 'growth');
  };
  btnGdp.addEventListener('click', () => show('gdp'));
  btnGrowth.addEventListener('click', () => show('growth'));
}

// --- Regions: live search filter and column sorting -------------------------
function initRegions() {
  const search = document.getElementById('region-search');
  const body = document.getElementById('region-body');
  const count = document.getElementById('region-count');
  const headers = [...document.querySelectorAll('#region-table th')];
  let sortKey = 'gdp';
  let sortDir = -1; // 1 = ascending, -1 = descending
  let query = '';

  const valueOf = (p, key) => {
    if (key === 'name') return p.name.toLowerCase();
    if (key === 'share') return p.gdp / nationalGdp2024;
    return p.gdp; // 'gdp' and 'rank' both follow GDP; descending restores the ranking
  };

  const draw = () => {
    const rows = provinces2024
      .filter((p) => p.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const va = valueOf(a, sortKey), vb = valueOf(b, sortKey);
        return (va < vb ? -1 : va > vb ? 1 : 0) * sortDir;
      });
    body.innerHTML = rows.length
      ? rows.map((p) => regionRow(p, provinces2024.indexOf(p) + 1)).join('')
      : '<tr><td colspan="4" class="empty">No region matches that search.</td></tr>';
    count.textContent = `${rows.length} of ${provinces2024.length} regions shown. Click a column heading to sort; type above to filter.`;
    headers.forEach((th) => {
      const on = th.dataset.key === sortKey;
      th.classList.toggle('sorted-desc', on && sortDir === -1);
      th.classList.toggle('sorted-asc', on && sortDir === 1);
    });
  };

  search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); draw(); });
  headers.forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (key === sortKey) sortDir *= -1;
      else { sortKey = key; sortDir = key === 'name' ? 1 : -1; }
      draw();
    });
  });
  draw();
}

// --- Explorer: the year slider ----------------------------------------------
function initExplorer() {
  const slider = document.getElementById('year-slider');
  const ticks = [...document.querySelectorAll('.tickrow span')];
  const set = (id, text) => { document.getElementById(id).textContent = text; };
  const update = () => {
    const i = Number(slider.value);
    const gdpPerCapita = (gdpTrillion[i] * 1e12) / (populationMillions[i] * 1e6);
    set('ex-year', String(years[i]));
    set('ex-pop', `${populationMillions[i].toLocaleString('en-US')} million`);
    set('ex-gdp', `¥${gdpTrillion[i].toFixed(1)} trillion`);
    set('ex-urb', `${urbanisationPct[i].toFixed(1)}%`);
    set('ex-gdppc', `¥${Math.round(gdpPerCapita).toLocaleString('en-US')}`);
    // Bold the year under the slider thumb so the position reads at a glance.
    ticks.forEach((t, j) => t.classList.toggle('tick-on', j === i));
  };
  slider.addEventListener('input', update);
  update();
}

window.addEventListener('hashchange', render);
render();
