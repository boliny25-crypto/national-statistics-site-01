// Page templates and chart drawing for China in Numbers.
//
// Every chart is an inline SVG string built here from the numbers in data.js — there are no chart
// libraries and no image files. Pages are plain functions returning HTML; main.js picks the page for
// the current hash route and wires up the interactive controls afterwards.

import {
  SOURCE_NOTE,
  years,
  populationMillions,
  gdpTrillion,
  gdpGrowthPct,
  urbanisationPct,
  incomeYears,
  urbanIncome,
  ruralIncome,
  headline2024,
  population2024,
  sectors2024,
  economy2024,
  living2024,
  provinces2024,
  nationalGdp2024,
} from './data.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fmt = (n, digits = 0) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const ACCENT = '#0f5aa7';
export const ACCENT2 = '#c0392b';

// ---------------------------------------------------------------------------
// Line chart: one or more series over shared x labels, drawn as SVG.
// opts: { height, yDigits, ySuffix, minZero } — the y domain is padded around
// the data unless minZero pins the baseline at 0.
// ---------------------------------------------------------------------------
export function lineChart(labels, series, opts = {}) {
  const W = 720;
  const H = opts.height ?? 300;
  const padL = 58, padR = 14, padT = 20, padB = 36;
  const iw = W - padL - padR, ih = H - padT - padB;
  const all = series.flatMap((s) => s.values);
  let lo = Math.min(...all), hi = Math.max(...all);
  if (opts.minZero) lo = Math.min(0, lo);
  const span = hi - lo || 1;
  lo -= span * 0.12; hi += span * 0.18;
  if (opts.minZero) lo = Math.min(0, lo);
  const x = (i) => padL + (i / (labels.length - 1)) * iw;
  const y = (v) => padT + ih - ((v - lo) / (hi - lo)) * ih;

  // Four horizontal gridlines with value labels.
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const v = lo + ((hi - lo) * g) / 4;
    const gy = y(v);
    grid += `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" class="grid"/>` +
      `<text x="${padL - 8}" y="${gy + 4}" class="axis" text-anchor="end">${fmt(v, opts.yDigits ?? 0)}${opts.ySuffix ?? ''}</text>`;
  }
  const xlabels = labels.map((l, i) =>
    `<text x="${x(i)}" y="${H - 12}" class="axis" text-anchor="middle">${l}</text>`).join('');

  const lines = series.map((s) => {
    const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const dots = s.values.map((v, i) =>
      `<circle cx="${x(i)}" cy="${y(v)}" r="3.2" fill="${s.color}"><title>${labels[i]}: ${fmt(v, s.digits ?? 1)}${s.unit ?? ''}</title></circle>`).join('');
    const last = s.values.length - 1;
    const endLabel = `<text x="${x(last) - 2}" y="${y(s.values[last]) - 10}" class="endlabel" text-anchor="end" fill="${s.color}">${fmt(s.values[last], s.digits ?? 1)}${s.unit ?? ''}</text>`;
    return `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linejoin="round"/>${dots}${endLabel}`;
  }).join('');

  const legend = series.length > 1
    ? `<div class="legend">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`
    : '';

  return `${legend}<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(opts.aria ?? 'Line chart')}">${grid}${xlabels}${lines}</svg>`;
}

// Grouped bar chart for the urban vs rural income comparison.
export function incomeChart() {
  const W = 720, H = 300;
  const padL = 58, padR = 14, padT = 20, padB = 36;
  const iw = W - padL - padR, ih = H - padT - padB;
  const max = 60000;
  const y = (v) => padT + ih - (v / max) * ih;
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const v = (max * g) / 4, gy = y(v);
    grid += `<line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" class="grid"/>` +
      `<text x="${padL - 8}" y="${gy + 4}" class="axis" text-anchor="end">${fmt(v)}</text>`;
  }
  const groupW = iw / incomeYears.length;
  const barW = Math.min(26, groupW / 3);
  let bars = '';
  incomeYears.forEach((yr, i) => {
    const cx = padL + groupW * i + groupW / 2;
    bars += `<rect x="${cx - barW - 3}" y="${y(urbanIncome[i])}" width="${barW}" height="${padT + ih - y(urbanIncome[i])}" fill="${ACCENT}"><title>${yr} urban: ¥${fmt(urbanIncome[i])}</title></rect>`;
    bars += `<rect x="${cx + 3}" y="${y(ruralIncome[i])}" width="${barW}" height="${padT + ih - y(ruralIncome[i])}" fill="${ACCENT2}"><title>${yr} rural: ¥${fmt(ruralIncome[i])}</title></rect>`;
    bars += `<text x="${cx}" y="${H - 12}" class="axis" text-anchor="middle">${yr}</text>`;
    bars += `<text x="${cx - barW / 2 - 3}" y="${y(urbanIncome[i]) - 5}" class="barlabel" text-anchor="middle">${fmt(urbanIncome[i] / 1000, 1)}k</text>`;
    bars += `<text x="${cx + barW / 2 + 3}" y="${y(ruralIncome[i]) - 5}" class="barlabel" text-anchor="middle">${fmt(ruralIncome[i] / 1000, 1)}k</text>`;
  });
  return `<div class="legend"><span><i style="background:${ACCENT}"></i>Urban households</span><span><i style="background:${ACCENT2}"></i>Rural households</span></div>` +
    `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Bar chart of urban and rural disposable income, 2020 to 2024">${grid}${bars}</svg>`;
}

// Horizontal bars for the 2024 sector shares.
export function sectorBars() {
  return `<div class="sectorbars">${sectors2024.map((s) => `
    <div class="sectorrow">
      <span class="sectorname">${esc(s.name)}</span>
      <span class="sectorbar"><i style="width:${s.share}%"></i></span>
      <span class="sectorval">${s.share.toFixed(1)}%</span>
    </div>`).join('')}</div>`;
}

const sourceLine = `<p class="source">${esc(SOURCE_NOTE)}</p>`;

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export function overviewPage() {
  const cards = headline2024.map((k) => `
    <article class="kpi">
      <h3>${esc(k.label)}</h3>
      <p class="kpivalue">${esc(k.value)}</p>
      <p class="kpinote">${esc(k.note)}</p>
    </article>`).join('');

  const teasers = [
    { href: '#/population', title: 'Population', text: 'A peak of 1.41 billion, two years of gentle decline, and a rapidly ageing age structure.' },
    { href: '#/economy', title: 'Economy', text: 'GDP growth and output since 2015, the sector mix, retail sales and investment.' },
    { href: '#/living', title: 'Living standards', text: 'What households earn and spend: disposable income in town and countryside, and the Engel coefficient.' },
    { href: '#/regions', title: 'Regions', text: 'Provincial GDP in 2024 in a searchable, sortable table — Guangdong alone tops ¥14 trillion.' },
    { href: '#/explore', title: 'Explorer', text: 'Drag the year slider from 2015 to 2024 and watch population, output and urbanisation move.' },
  ].map((t) => `
    <a class="teaser" href="${t.href}">
      <h3>${esc(t.title)} <span aria-hidden="true">→</span></h3>
      <p>${esc(t.text)}</p>
    </a>`).join('');

  return `
  <section class="hero">
    <h1>China in Numbers</h1>
    <p class="lede">The headline statistics of the world's second-largest economy, drawn from China's official
    annual releases: population, output, incomes and regions, 2015–2024, with the full 2024 picture below.</p>
  </section>
  <section>
    <h2>China in 2024 — headline indicators</h2>
    <div class="kpigrid">${cards}</div>
  </section>
  <section>
    <h2>Gross domestic product, 2015–2024</h2>
    <p>GDP at current prices, trillion yuan. Output has almost doubled in a decade, passing ¥100 trillion in 2020.</p>
    ${lineChart(years, [{ name: 'GDP', values: gdpTrillion, color: ACCENT, digits: 1, unit: ' tn' }], { aria: 'Line chart of GDP in trillion yuan, 2015 to 2024', yDigits: 0 })}
  </section>
  <section>
    <h2>Explore the statistics</h2>
    <div class="teasers">${teasers}</div>
  </section>
  ${sourceLine}`;
}

export function populationPage() {
  const p = population2024;
  return `
  <h1>Population</h1>
  <p class="lede">China's population peaked at 1,413 million at the end of 2021 and has since edged down:
  births no longer offset deaths, even as urbanisation continues.</p>
  <section>
    <h2>Year-end population, 2015–2024 (millions)</h2>
    ${lineChart(years, [{ name: 'Population', values: populationMillions, color: ACCENT, digits: 0, unit: ' m' }], { aria: 'Line chart of year-end population in millions, 2015 to 2024', yDigits: 0 })}
  </section>
  <section>
    <h2>Births, deaths and natural change, 2024</h2>
    <div class="kpigrid">
      <article class="kpi"><h3>Births</h3><p class="kpivalue">${p.births.toFixed(2)} million</p><p class="kpinote">Birth rate 6.77 per thousand</p></article>
      <article class="kpi"><h3>Deaths</h3><p class="kpivalue">${p.deaths.toFixed(2)} million</p><p class="kpinote">Death rate 7.76 per thousand</p></article>
      <article class="kpi"><h3>Natural change</h3><p class="kpivalue">${p.naturalChange.toFixed(2)} million</p><p class="kpinote">Natural growth rate −0.99 per thousand</p></article>
    </div>
  </section>
  <section>
    <h2>An ageing population</h2>
    <p>People aged 60 and over numbered <strong>${p.age60plus.people.toFixed(2)} million</strong> at the end of 2024 —
    <strong>${p.age60plus.share.toFixed(1)}%</strong> of the total. Those aged 65 and over numbered
    <strong>${p.age65plus.people.toFixed(2)} million</strong>, or <strong>${p.age65plus.share.toFixed(1)}%</strong>.
    The working-age population (16–59) stood at 857.98 million, 60.9% of the total.</p>
  </section>
  <section>
    <h2>Town and country</h2>
    <p>Urban residents numbered <strong>${p.urban.toFixed(2)} million</strong> (67.00% of the population) and rural
    residents <strong>${p.rural.toFixed(2)} million</strong> (33.00%). The urban share has risen every year in the
    series — see the <a href="#/explore">Explorer</a> to follow it year by year.</p>
  </section>
  ${sourceLine}`;
}

export function economyPage() {
  return `
  <h1>Economy</h1>
  <p class="lede">GDP reached ¥134.91 trillion in 2024. Use the toggle to switch between the size of the
  economy at current prices and its real growth rate.</p>
  <section>
    <h2>GDP and growth, 2015–2024</h2>
    <div class="toggle" role="group" aria-label="Chart measure">
      <button type="button" id="btn-gdp" class="togglebtn active">Total GDP (¥ trillion)</button>
      <button type="button" id="btn-growth" class="togglebtn">Real growth (%)</button>
    </div>
    <div id="economy-chart">
      ${lineChart(years, [{ name: 'GDP', values: gdpTrillion, color: ACCENT, digits: 1, unit: ' tn' }], { aria: 'Line chart of GDP in trillion yuan, 2015 to 2024', yDigits: 0 })}
    </div>
    <p class="chartnote" id="economy-note">Current prices. Growth slowed to 2.2% in 2020, rebounded to 8.4% in 2021, and has run at about 5% since 2023.</p>
  </section>
  <section>
    <h2>What the economy produces, 2024</h2>
    ${sectorBars()}
    <p>Services now account for well over half of output, while agriculture's share has fallen below 7%.</p>
  </section>
  <section>
    <h2>Demand in 2024</h2>
    <div class="kpigrid">
      <article class="kpi"><h3>Retail sales of consumer goods</h3><p class="kpivalue">¥${economy2024.retailSalesTrillion.toFixed(2)} trillion</p><p class="kpinote">Up ${economy2024.retailGrowthPct.toFixed(1)}% on 2023</p></article>
      <article class="kpi"><h3>Fixed-asset investment</h3><p class="kpivalue">+${economy2024.fixedAssetGrowthPct.toFixed(1)}%</p><p class="kpinote">Growth in 2024, excluding rural households</p></article>
      <article class="kpi"><h3>Exports of goods</h3><p class="kpivalue">¥25.45 trillion</p><p class="kpinote">Up 7.1% on 2023</p></article>
    </div>
  </section>
  ${sourceLine}`;
}

// The two economy chart variants, swapped by the toggle in main.js.
export function economyChart(mode) {
  if (mode === 'growth') {
    return lineChart(years, [{ name: 'Real growth', values: gdpGrowthPct, color: ACCENT2, digits: 1, unit: '%' }],
      { aria: 'Line chart of real GDP growth in percent, 2015 to 2024', yDigits: 1, ySuffix: '%', minZero: true });
  }
  return lineChart(years, [{ name: 'GDP', values: gdpTrillion, color: ACCENT, digits: 1, unit: ' tn' }],
    { aria: 'Line chart of GDP in trillion yuan, 2015 to 2024', yDigits: 0 });
}

export function livingPage() {
  const l = living2024;
  const ratio = (l.urbanDisposable / l.ruralDisposable).toFixed(2);
  return `
  <h1>Living standards</h1>
  <p class="lede">Household incomes have kept rising in both town and countryside. The urban–rural gap
  remains wide but narrows a little each year.</p>
  <section>
    <div class="kpigrid">
      <article class="kpi"><h3>Disposable income per capita, 2024</h3><p class="kpivalue">¥${fmt(l.disposableIncome)}</p><p class="kpinote">Up 5.3% nominal, 5.1% in real terms</p></article>
      <article class="kpi"><h3>Urban households</h3><p class="kpivalue">¥${fmt(l.urbanDisposable)}</p><p class="kpinote">Per capita disposable income, 2024</p></article>
      <article class="kpi"><h3>Rural households</h3><p class="kpivalue">¥${fmt(l.ruralDisposable)}</p><p class="kpinote">Per capita disposable income, 2024</p></article>
      <article class="kpi"><h3>Engel coefficient</h3><p class="kpivalue">${l.engelPct.toFixed(1)}%</p><p class="kpinote">Food share of household consumption spending, 2024</p></article>
    </div>
    <p>Urban disposable income is <strong>${ratio} times</strong> the rural level (¥${fmt(l.urbanDisposable)} against
    ¥${fmt(l.ruralDisposable)}), down from 2.56 times in 2020. Per-capita consumption expenditure in 2024 was
    ¥28,227 nationally. The Engel coefficient — the share of spending that goes on food — was ${l.engelPct.toFixed(1)}%
    nationally, 28.8% in urban areas and 32.3% in rural areas.</p>
  </section>
  <section>
    <h2>Urban vs rural disposable income, 2020–2024 (yuan per person)</h2>
    ${incomeChart()}
    <p>Rural incomes grew faster in each of these years: in 2024 rural disposable income rose 6.6% nominally,
    against 4.6% in urban areas.</p>
  </section>
  ${sourceLine}`;
}

// One row of the regions table; also used by main.js when re-sorting or filtering.
export function regionRow(p, rank) {
  const share = (p.gdp / nationalGdp2024) * 100;
  return `<tr><td class="num">${rank}</td><td>${esc(p.name)}</td><td class="num">${p.gdp.toFixed(2)}</td><td class="num">${share.toFixed(1)}%</td></tr>`;
}

export function regionsPage() {
  return `
  <h1>Regions</h1>
  <p class="lede">GDP of China's largest provincial-level economies in 2024, at current prices. The thirteen
  regions below each produced more than ¥4.7 trillion — together about 60% of national output.</p>
  <section>
    <label class="searchlabel" for="region-search">Search regions</label>
    <input id="region-search" type="search" placeholder="Type a region name, e.g. Jiangsu" autocomplete="off">
    <div class="tablewrap">
      <table id="region-table">
        <thead>
          <tr>
            <th data-key="rank" class="sortable" scope="col">Rank</th>
            <th data-key="name" class="sortable" scope="col">Region</th>
            <th data-key="gdp" class="sortable sorted-desc" scope="col">GDP 2024 (¥ trillion)</th>
            <th data-key="share" class="sortable" scope="col">Share of national GDP</th>
          </tr>
        </thead>
        <tbody id="region-body">
          ${provinces2024.map((p, i) => regionRow(p, i + 1)).join('')}
        </tbody>
      </table>
    </div>
    <p class="chartnote" id="region-count">${provinces2024.length} regions shown. Click a column heading to sort; type above to filter.</p>
  </section>
  ${sourceLine}`;
}

export function explorePage() {
  const last = years.length - 1;
  return `
  <h1>Explorer</h1>
  <p class="lede">One slider, ten years. Move it to see how China's population, output and urbanisation
  changed between 2015 and 2024. GDP per capita is computed from the two rounded series.</p>
  <section class="explorer">
    <label class="sliderlabel" for="year-slider">Year: <strong id="ex-year">${years[last]}</strong></label>
    <input id="year-slider" type="range" min="0" max="${last}" step="1" value="${last}" aria-describedby="ex-year">
    <div class="tickrow">${years.map((y) => `<span>${y}</span>`).join('')}</div>
    <div class="kpigrid">
      <article class="kpi"><h3>Population (year-end)</h3><p class="kpivalue" id="ex-pop">—</p><p class="kpinote">Millions of people</p></article>
      <article class="kpi"><h3>GDP</h3><p class="kpivalue" id="ex-gdp">—</p><p class="kpinote">Trillion yuan, current prices</p></article>
      <article class="kpi"><h3>Urbanisation</h3><p class="kpivalue" id="ex-urb">—</p><p class="kpinote">Urban share of population</p></article>
      <article class="kpi"><h3>GDP per capita (computed)</h3><p class="kpivalue" id="ex-gdppc">—</p><p class="kpinote">GDP divided by year-end population</p></article>
    </div>
    <p class="chartnote">The 2023 urbanisation figure steps up because it follows revisions based on the 2020
    population census. Computed GDP per capita differs slightly from the official figure, which uses the
    average population over the year rather than the year-end population.</p>
  </section>
  ${sourceLine}`;
}

export function missingPage() {
  return `<h1>Page not found</h1>
  <p>There is no page at this address. Start again from the <a href="#/">overview</a>.</p>`;
}
