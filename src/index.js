import { commands } from "./constants.js";

/* -------------------------------------------- */
/* ------------ Variables & States ------------ */
/* -------------------------------------------- */

/**
 * Constants
 */
const defaultSearchEngineKey = "b";

/**
 * State variables
 */

/**
 * @state state variable to track if suggestions are shown
 */
var areSuggestionsShown = false;

/**
 * Current search engine key, used for the search
 *
 * @default - Brave Search Engine [defaultSearchEngineKey]
 */
let currentSearchEngineKey = defaultSearchEngineKey;

/* ----------------------------------- */
/* ------------ Listeners ------------ */
/* ----------------------------------- */

/**
 * Initializes event listeners for DOM interactions.
 */
document.addEventListener("DOMContentLoaded", () => {
  listenToKeyDown();
  listenToSearchTab();
});

/**
 * Adds a global keyboard listener for shortcuts.
 */
function listenToKeyDown() {
  document.addEventListener("keydown", function (event) {
    // [ALT + K ] To focus search input
    if (event.altKey && event.key === "k") {
      event.preventDefault();
      focusSearchTab();
    }
  });
}

/**
 * Sets up listeners for the search input's interactions.
 */
function listenToSearchTab() {
  const search = document.getElementById("search-input");

  search.addEventListener("input", () => {
    clearSuggestionsDiv();
    const trimmedValue = search.value.trim();

    if (trimmedValue.length == 0) return;

    if (trimmedValue === ":") {
      toggleVisibilityOfSuggestionDiv();
      renderSuggestionCommands(":");
      return;
    } else if (isInputACommand(trimmedValue)) {
      if (trimmedValue[0] === ":" && trimmedValue.length === 2) {
        const searchKey = trimmedValue[1];

        // do nothing if the key is invalid
        if (!commands[":"][searchKey]) return;

        const searchEngineName = commands[":"][searchKey]["name"];

        renderSearchEngineName(searchEngineName);
        search.value = "";

        // update the current search engine
        currentSearchEngineKey = searchKey;
      }
    }
  });

  search.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
      if (search.value.length === 0) {
        clearSearchEngineName();
      }
    } else if (event.key === "Enter") {
      performSearch(search.value.trim());
    }
  });
}

function isInputACommand(input) {
  const trimmedInput = input.trim();

  if (trimmedInput[0] === ":") {
    return true;
  }

  return false;
}

function renderSuggestionCommands(command) {
  const subCommands = commands[command];

  if (!subCommands) {
    console.error(`Command ${command} does not exists`);
    return;
  }

  for (const key in subCommands) {
    const cmdObject = subCommands[key];
    const title = `Search w/ ${cmdObject["name"]}`;

    createSuggestionCommand(title, `:${key}`);
  }
}

function createSuggestionCommand(title, shortcut) {
  const suggestionsDiv = document.getElementById("suggestions");

  if (!suggestionsDiv) {
    console.error("Div w/ id [suggestions] not found");
    return;
  }

  const commandDiv = document.createElement("div");
  const text = document.createElement("p");
  const button = document.createElement("button");

  commandDiv.classList.add("command", "flex", "row", "xCenter");
  text.classList.add("text1");
  button.classList.add("radius1", "text2");

  text.textContent = title;
  button.textContent = shortcut;

  commandDiv.appendChild(text);
  commandDiv.appendChild(button);

  suggestionsDiv.appendChild(commandDiv);
}

function clearSuggestionsDiv() {
  const suggestionsDiv = document.getElementById("suggestions");

  if (!suggestionsDiv) {
    console.error("Div w/ id [suggestions] not found");
    return;
  }

  suggestionsDiv.innerHTML = "";
  suggestionsDiv.style.display = "none";
  areSuggestionsShown = false;
}

function toggleVisibilityOfSuggestionDiv() {
  if (areSuggestionsShown) return;

  const suggestionsDiv = document.getElementById("suggestions");

  if (!suggestionsDiv) {
    console.error("Div w/ id [suggestions] not found");
    return;
  }

  suggestionsDiv.style.display = "flex";
  areSuggestionsShown = true;
}

function renderSearchEngineName(name) {
  const searchDiv = document.getElementById("search-div");
  const img = searchDiv.querySelector("img");
  const p = document.createElement("p");

  p.classList.add("body1", "searchEngineName");
  p.textContent = `${name} |`;
  p.id = "searchEngineName";

  searchDiv.insertBefore(p, img.nextSibling);
}

function clearSearchEngineName() {
  const searchEngineName = document.getElementById("searchEngineName");

  if (searchEngineName) {
    searchEngineName.remove();
  }
}

function isValidURL(url) {
  const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

  return regex.test(url);
}

function performSearch(input) {
  const searchUrl = commands[":"][currentSearchEngineKey]["url"];

  console.log(searchUrl);

  if (isValidURL(input)) {
    const url = "https://" + input;
    window.open(url, "_self");
  } else {
    const url = searchUrl.replace("%s", encodeURIComponent(input));

    window.open(url, "_self");
  }

  currentSearchEngineKey = defaultSearchEngineKey;
}

/* ------------ Utilities ------------ */

/**
 * Focuses on the search input element.
 */
function focusSearchTab() {
  const search = document.getElementById("search-input");
  search.focus();
}
