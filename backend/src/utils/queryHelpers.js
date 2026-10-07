function normalizeSearch(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseBoolean(value) {
  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return undefined;
}

module.exports = {
  normalizeSearch,
  parseBoolean,
};