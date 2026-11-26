// All figures shown on the site, in one place.
//
// Source: National Bureau of Statistics of China, Statistical Communiqué on the 2024 National
// Economic and Social Development (February 2025), and the corresponding communiqués for earlier
// years. Figures are rounded as published; totals may not sum exactly because of rounding.
// Historical GDP values are at current prices and reflect published revisions.

export const SOURCE_NOTE =
  'Source: National Bureau of Statistics of China, 2024 Statistical Communiqué (and earlier annual communiqués). Figures are rounded.';

// The ten years every time series on the site covers.
export const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// Year-end total population, millions of people.
export const populationMillions = [1375, 1383, 1390, 1395, 1400, 1412, 1413, 1412, 1410, 1408];

// Gross domestic product, trillion yuan, current prices.
export const gdpTrillion = [68.9, 74.6, 83.2, 91.9, 98.7, 101.4, 114.9, 120.5, 126.1, 134.9];

// Real GDP growth, percent year on year.
export const gdpGrowthPct = [6.9, 6.7, 6.9, 6.7, 6.1, 2.2, 8.4, 3.0, 5.2, 5.0];

// Urban population as a share of the total, percent. The step up in 2023 follows the revisions
// based on the 2020 population census and the 2023 population change sample survey.
export const urbanisationPct = [56.1, 57.4, 58.5, 59.6, 60.6, 61.9, 62.5, 63.6, 66.2, 67.0];

// Per-capita disposable income of households, yuan per year, 2020-2024.
export const incomeYears = [2020, 2021, 2022, 2023, 2024];
export const urbanIncome = [43834, 47412, 49283, 51821, 54188];
export const ruralIncome = [17131, 18931, 20133, 21691, 23119];

// Headline indicators for 2024, shown as cards on the overview page.
export const headline2024 = [
  { label: 'Population (year-end)', value: '1,408.28 million', note: 'Down 1.39 million during 2024' },
  { label: 'GDP', value: '¥134.91 trillion', note: 'Up 5.0% in real terms' },
  { label: 'GDP per capita', value: '¥95,749', note: 'Up 5.1% in real terms' },
  { label: 'Urbanisation rate', value: '67.00%', note: '943.50 million urban residents' },
  { label: 'Disposable income per capita', value: '¥41,314', note: 'Up 5.3% nominal, 5.1% real' },
  { label: 'Consumer prices (CPI)', value: '+0.2%', note: 'Annual average change, 2024' },
  { label: 'Surveyed urban unemployment', value: '5.1%', note: 'Annual average, 2024' },
  { label: 'Retail sales of consumer goods', value: '¥48.79 trillion', note: 'Up 3.5% on 2023' },
];

// Population detail for 2024.
export const population2024 = {
  births: 9.54, // million
  deaths: 10.93, // million
  naturalChange: -1.39, // million
  age60plus: { people: 310.31, share: 22.0 }, // million, percent of total
  age65plus: { people: 220.23, share: 15.6 },
  urban: 943.5, // million
  rural: 464.78, // million
};

// Economy detail for 2024: shares of GDP by sector, percent.
export const sectors2024 = [
  { name: 'Primary industry (agriculture)', share: 6.8 },
  { name: 'Secondary industry (industry & construction)', share: 36.5 },
  { name: 'Tertiary industry (services)', share: 56.7 },
];

export const economy2024 = {
  retailSalesTrillion: 48.79,
  retailGrowthPct: 3.5,
  fixedAssetGrowthPct: 3.1,
};

// Living standards detail for 2024.
export const living2024 = {
  disposableIncome: 41314,
  urbanDisposable: 54188,
  ruralDisposable: 23119,
  engelPct: 29.8, // food share of household consumption spending
};

// GDP by provincial-level region, 2024, trillion yuan at current prices, largest first.
export const provinces2024 = [
  { name: 'Guangdong', gdp: 14.16 },
  { name: 'Jiangsu', gdp: 13.7 },
  { name: 'Shandong', gdp: 9.86 },
  { name: 'Zhejiang', gdp: 9.01 },
  { name: 'Sichuan', gdp: 6.47 },
  { name: 'Henan', gdp: 6.36 },
  { name: 'Hubei', gdp: 6.0 },
  { name: 'Fujian', gdp: 5.78 },
  { name: 'Shanghai', gdp: 5.39 },
  { name: 'Hunan', gdp: 5.3 },
  { name: 'Anhui', gdp: 5.06 },
  { name: 'Beijing', gdp: 4.98 },
  { name: 'Hebei', gdp: 4.75 },
];

export const nationalGdp2024 = 134.91; // trillion yuan, denominator for regional shares
