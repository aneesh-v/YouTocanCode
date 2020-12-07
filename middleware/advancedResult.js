const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Field to exclude
  const removeField = ['select', 'sort', 'page', 'limit'];

  // Loop over removeField and delete them from reqQuery
  removeField.forEach((param) => delete reqQuery[param]);

  // Create a query string
  let queryString = JSON.stringify(reqQuery);

  // Create operators like $gt, $lte etc if availabe and replacing the query string
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Generating query - Search filter-1(with operators if available)
  // /api/v1/bootcamps/?averageCost[gt]=10000 etc...
  query = model.find(JSON.parse(queryString));

  // Checking if select available in the query string
  if (req.query.select) {
    // Convert it into an arrya with spliting by ',' and join back as string
    // So etc from -> name,description to-> 'name description'
    const fields = req.query.select.split(',').join(' ');

    // Updating query - Search filter-2(fields) if available
    // /api/v1/bootcamps/?select=name,description etc...
    query = query.select(fields);
  }

  // Checking if sort available in the query string
  if (req.query.sort) {
    // See above comment
    const sortBy = req.query.sort.split(',').join(' ');

    // Updating query - Search filter-3(sorting) if available
    // /api/v1/bootcamps/?sort=name etc...
    query = query.sort(sortBy);
  } else {
    // Default sort by createdAt
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  // startIndex value is used to skip no.of documents based on limit value and page.
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalDocument = await model.countDocuments(JSON.parse(queryString));

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Execute query
  const results = await query;

  // Pagination result
  const pagination = {};

  // Adding next page if current page is not the last one
  if (endIndex < totalDocument) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  // Adding next page if current page is not the first one
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResults;
