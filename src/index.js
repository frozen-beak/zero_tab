import { commands } from "./constants.js";

/* -------------------------------------------- */
/* ------------ Variables & States ------------ */
/* -------------------------------------------- */

/**
 * Constants
 */

/**
 * @readonly
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
 * Initializes event listeners for **DOM** interactions.
 *
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
  listenToKeyDown();
  listenToSearchTab();

  // wait for 1 sec and then focus the search tab
  setTimeout(() => {
    focusSearchInput();
  }, 1000);
});

/**
 * Adds a global keyboard listener for shortcuts.
 *
 * @returns {void}
 */
function listenToKeyDown() {
  document.addEventListener("keydown", (event) => {
    // [ALT + K] Focus on the search input
    if (event.altKey && event.key === "k") {
      event.preventDefault();
      focusSearchInput();
    }
  });
}

/**
 * Sets up listeners for the search input's interactions.
 *
 * @returns {void}
 */
function listenToSearchTab() {
  const searchInput = document.getElementById("search-input");

  if (!searchInput) {
    console.error("Search input element not found!");
    return;
  }

  searchInput.addEventListener("input", handleSearchInput);
  searchInput.addEventListener("keydown", handleSearchKeyDown);
}

/**
 * Handles input events for the search bar.
 *
 * @param {Event} event - The input event.
 *
 * @returns {void}
 */
function handleSearchInput(event) {
  const inputValue = event.target.value.trim();

  clearSuggestionsDiv();

  if (!inputValue) return;

  if (inputValue === ":") {
    toggleVisibilityOfSuggestionDiv();

    renderSuggestionCommands(":");
  } else if (isInputACommand(inputValue)) {
    handleCommandInput(inputValue);
  }
}

/**
 * Handles specific commands typed in the input.
 *
 * @param {string} input - The user's input.
 *
 * @returns {void}
 */
function handleCommandInput(input) {
  if (input[0] === ":" && input.length === 2) {
    const commandKey = input[1];

    // Validate command key
    if (!commands[":"]?.[commandKey]) return;

    const searchEngineName = commands[":"][commandKey].name;

    renderSearchEngineName(searchEngineName);
    document.getElementById("search-input").value = "";

    // Update the current search engine
    currentSearchEngineKey = commandKey;
  }
}

/**
 * Handles keydown events in the search bar.
 *
 * @param {Event} event - The keydown event.
 *
 * @returns {void}
 */
function handleSearchKeyDown(event) {
  const searchInput = event.target;

  if (event.key === "Backspace" && searchInput.value.length === 0) {
    clearSearchEngineName();
  } else if (event.key === "Enter") {
    performSearch(searchInput.value.trim());
  }
}

/* -------------------------------------- */
/* ------------ DOM Mutation ------------ */
/* -------------------------------------- */

/**
 * Renders suggestion commands based on the provided command key.
 *
 * @param {string} commandKey - The command key (e.g., ":").
 *
 * @returns {void}
 */
function renderSuggestionCommands(commandKey) {
  const subCommands = commands[commandKey];

  if (!subCommands) {
    console.error(`Command ${commandKey} does not exist`);
    return;
  }

  Object.entries(subCommands).forEach(([key, cmdObject]) => {
    const title = `Search w/ ${cmdObject.name}`;
    createSuggestionCommand(title, `:${key}`);
  });
}

/**
 * Clears the search engine name displayed in the UI.
 *
 * @returns {void}
 */
function clearSearchEngineName() {
  const searchEngineNameElem = document.getElementById("searchEngineName");

  if (searchEngineNameElem) {
    searchEngineNameElem.remove();
  }
}

/**
 * Creates a suggestion command element.
 *
 * @param {string} title - The title of the command.
 * @param {string} shortcut - The shortcut key for the command.
 *
 * @returns {void}
 */
function createSuggestionCommand(title, shortcut) {
  const suggestionsDiv = document.getElementById("suggestions");

  if (!suggestionsDiv) {
    console.error("Suggestions div not found");
    return;
  }

  const commandDiv = document.createElement("div");
  commandDiv.className = "command flex row xCenter";

  const text = document.createElement("p");
  text.className = "text1";
  text.textContent = title;

  const button = document.createElement("button");
  button.className = "radius1 text2";
  button.textContent = shortcut;

  commandDiv.append(text, button);
  suggestionsDiv.appendChild(commandDiv);
}

/**
 * Clears all suggestion commands.
 *
 * @returns {void}
 */
function clearSuggestionsDiv() {
  const suggestionsDiv = document.getElementById("suggestions");
  if (!suggestionsDiv) return;

  suggestionsDiv.innerHTML = "";
  suggestionsDiv.style.display = "none";
  areSuggestionsShown = false;
}

/**
 * Toggles the visibility of the suggestions div.
 *
 * @returns {void}
 */
function toggleVisibilityOfSuggestionDiv() {
  if (areSuggestionsShown) return;

  const suggestionsDiv = document.getElementById("suggestions");

  if (suggestionsDiv) {
    suggestionsDiv.style.display = "flex";

    areSuggestionsShown = true;
  }
}

/**
 * Renders the name of the currently selected search engine.
 *
 * @param {string} name - The name of the search engine.
 *
 * @returns {void}
 */
function renderSearchEngineName(name) {
  const searchDiv = document.getElementById("search-div");
  const img = searchDiv.querySelector("img");
  const p = document.createElement("p");

  p.classList.add("body1", "searchEngineName");
  p.textContent = `${name} |`;
  p.id = "searchEngineName";

  clearSearchEngineName(); // ensure only one search engine name is displayed

  searchDiv.insertBefore(p, img.nextSibling);
}

/* --------------------------------- */
/* ------------ Actions ------------ */
/* --------------------------------- */

/**
 * Performs the search using the current search engine or directly opens a URL.
 *
 * @param {string} input - The user's search input.
 *
 * @returns {void}
 */
function performSearch(input) {
  const searchEngine = commands[":"][currentSearchEngineKey];

  if (!searchEngine) {
    console.error("Invalid search engine key");
    return;
  }

  const searchUrl = searchEngine.url;

  if (isValidURL(input)) {
    window.open(input.startsWith("http") ? input : `https://${input}`, "_self");
  } else {
    const url = searchUrl.replace("%s", encodeURIComponent(input));

    window.open(url, "_self"); // open the url in current window
  }

  // Reset to the default search engine
  currentSearchEngineKey = defaultSearchEngineKey;
}

/* ----------------------------------- */
/* ------------ Utilities ------------ */
/* ----------------------------------- */

/**
 * Focuses on the search input element.
 *
 * @returns {void}
 */
function focusSearchInput() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.focus();
}

/**
 * Validates if a string is a URL.
 *
 * @param {string} url - The URL string to validate.
 *
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidURL(url) {
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

  return urlPattern.test(url);
}

/**
 * Checks if the input is a command.
 *
 * @param {string} input - The user's input.
 *
 * @returns {boolean} True if input is a command, false otherwise.
 */
function isInputACommand(input) {
  return input.startsWith(":");
}
