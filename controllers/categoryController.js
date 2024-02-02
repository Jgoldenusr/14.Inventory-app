const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.category_list = asyncHandler(async (req, res, next) => {
  const category_list = await Category.find({}).sort({ name: 1 }).exec();

  res.render("layout", {
    view: "category_list",
    title: "Categorias",
    data: category_list,
    error: null,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, category_items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).populate("category").exec(),
  ]);

  if (category === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    view: "category_detail",
    title: category.name,
    data: { category, category_items },
    error: null,
  });
});

exports.category_create_get = (req, res, next) => {
  res.render("layout", {
    view: "category_form",
    title: "Crear categoria",
    data: null,
    error: null,
  });
};

exports.category_create_post = [
  body("name", "Se requiere un nombre para la categoria")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("description").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render("layout", {
        view: "category_form",
        title: "Crear categoria",
        data: category,
        error: errors.array(),
      });
      return;
    } else {
      const category_exists = await Category.findOne({
        name: req.body.name,
      }).exec();

      if (category_exists) {
        res.redirect(category_exists.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, category_items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).populate("category").exec(),
  ]);

  if (category === null) {
    res.redirect("/inventory/category");
  }

  res.render("layout", {
    view: "category_delete",
    title: "Borrar categoria",
    data: { category, category_items },
    error: null,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, category_items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).populate("category").exec(),
  ]);

  if (category_items.length > 0) {
    res.render("layout", {
      view: "category_delete",
      title: "Borrar categoria",
      data: { category, category_items },
      error: null,
    });
    return;
  }

  await Category.findByIdAndRemove(req.body.categoryId);
  res.redirect("/inventory/category");
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  res.render("layout", {
    view: "category_form",
    title: "Actualizar categoria",
    data: category,
    error: null,
  });
});

exports.category_update_post = [
  body("name", "Se requiere un nombre para la categoria")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("description").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("layout", {
        view: "category_form",
        title: "Actualizar categoria",
        data: category,
        error: errors.array(),
      });
      return;
    } else {
      const category_exists = await Category.findOne({
        name: req.body.name,
      }).exec();

      if (category_exists) {
        res.redirect(category_exists.url);
      } else {
        const theCategory = await Category.findByIdAndUpdate(
          req.params.id,
          category,
          {}
        );
        res.redirect(theCategory.url);
      }
    }
  }),
];
