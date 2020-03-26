const isValidEmail = (email) => {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

const pagination = (nameOfCollections, page, numberOfPages, limit) => {
  const linksHeader = {
    next: `</${nameOfCollections}?page=${page + 1 > numberOfPages ? page : page + 1}&limit=${limit}>; rel="next"`,
    last: `</${nameOfCollections}?page=${numberOfPages}&limit=${limit}>; rel="last"`,
    first: `</${nameOfCollections}?page=1&limit=${limit}>; rel="first"`,
    prev: `</${nameOfCollections}?page=${page > 1 ? page - 1 : 1}&limit=${limit}>; rel="prev"`,
  };
  return linksHeader;
};

module.exports = { isValidEmail, pagination };
