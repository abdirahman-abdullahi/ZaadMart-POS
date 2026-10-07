function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);

  const requestedLimit = parseInt(query.limit, 10) || 20;

  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
}

function getPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = {
  getPagination,
  getPaginationMeta,
};