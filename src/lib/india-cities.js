// Full list of Indian cities per state for the City dropdown. The dataset is
// large, so it's loaded on first use instead of shipping in the main bundle.
// It has no district information — district-level matches come from the
// backend (cities already saved under that district) and are listed first.

const STATE_NAME_ALIASES = {
  "new delhi": "delhi",
  orissa: "odisha",
};

function normalize(name) {
  return (name || "").trim().toLowerCase();
}

let datasetPromise = null;
const cityCache = new Map();

function loadDataset() {
  datasetPromise ??= import("country-state-city").then(({ State, City }) => {
    const codeByName = new Map(
      State.getStatesOfCountry("IN").map(({ name, isoCode }) => [normalize(name), isoCode]),
    );
    return { City, codeByName };
  });
  return datasetPromise;
}

// Sorted, de-duplicated city names for whatever state name was typed, or []
// if it doesn't match a known Indian state.
export async function getCitiesForStateName(stateName) {
  const key = normalize(STATE_NAME_ALIASES[normalize(stateName)] || stateName);
  if (!key) return [];
  if (cityCache.has(key)) return cityCache.get(key);

  const { City, codeByName } = await loadDataset();
  const code = codeByName.get(key);
  const names = code
    ? [...new Set(City.getCitiesOfState("IN", code).map((city) => city.name))].sort((a, b) =>
        a.localeCompare(b),
      )
    : [];

  cityCache.set(key, names);
  return names;
}
