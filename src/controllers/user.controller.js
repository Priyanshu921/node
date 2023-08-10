const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          as: "posts",
          localField: "_id",
          foreignField: "userId",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          posts: { $size: "$posts" },
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);
    const totalDocs = await User.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);
    res.status(200).json({
      data: {
        users,
        pagination: {
          totalDocs,
          limit,
          page,
          totalPages,
          pagingCounter: (page - 1) * limit + 1,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < totalPages ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};
