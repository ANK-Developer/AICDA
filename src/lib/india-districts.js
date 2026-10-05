import { getAllStates, getDistricts } from "india-state-district";

// Our State field is free-typed (see STATES in directory-shared.jsx) rather
// than tied to this library's codes, and a couple of names differ from what
// the library calls them — bridge those before failing to match.
const STATE_NAME_ALIASES = {
  "new delhi": "delhi",
  orissa: "odisha",
};

function normalize(name) {
  return (name || "").trim().toLowerCase();
}

let stateCodeByName = null;

function stateNameIndex() {
  if (stateCodeByName) return stateCodeByName;
  stateCodeByName = new Map();
  getAllStates().forEach(({ code, name }) => {
    stateCodeByName.set(normalize(name), code);
  });
  return stateCodeByName;
}

// Given whatever the admin typed into the State field, returns the district
// list for it — or [] if it doesn't match a known Indian state (e.g. still
// mid-typing, or a custom/foreign value).
export function getDistrictsForStateName(stateName) {
  const key = normalize(STATE_NAME_ALIASES[normalize(stateName)] || stateName);
  const code = stateNameIndex().get(key);
  return code ? getDistricts(code) : [];
}
