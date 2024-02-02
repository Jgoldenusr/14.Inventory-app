const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const [item_count, category_count] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("layout", {
    view: "index",
    title: "Inventory-App | Inicio",
    data: { item_count, category_count },
    error: null,
  });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item == null) {
    const notFound = new Error("Item not found");
    notFound.status = 404;
    return next(notFound);
  }

  res.render("layout", {
    view: "item_detail",
    title: item.name,
    data: item,
    error: null,
  });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({}).exec();

  res.render("layout", {
    view: "item_form",
    title: "Crear objeto",
    data: { categories },
    error: null,
  });
});

exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  body("name", "El nombre debe contener minimo un caracter y maximo 30")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape(),
  body("description", "Debe ingresar una descripcion")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("inStock")
    .matches(/^[0-9]+$/)
    .withMessage(
      "El numero de objetos en stock debe ser un numero entero positivo"
    )
    .customSanitizer((val) => parseInt(val)),
  body("price")
    .matches(/^[0-9]+([.][0-9]+)?$/)
    .withMessage(
      "El numero de objetos en stock debe ser un numero entero positivo"
    )
    .customSanitizer((val) => parseFloat(val)),
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      inStock: req.body.inStock,
      category: req.body.category,
      price: req.body.price,
    });

    if (!errors.isEmpty()) {
      const categories = await Category.find({}).exec();
      for (const category of categories) {
        if (item.category.includes(category._id)) {
          category.checked = "true";
        }
      }
      res.render("layout", {
        view: "item_form",
        title: "Crear objeto",
        data: { categories, item },
        error: errors.array(),
      });
      return;
    } else {
      await item.save();
      res.redirect(item.url);
    }
  }),
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    const err = new Error("No se encontro el objeto");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    view: "item_delete",
    title: "Borrar objeto",
    data: item,
    error: null,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndRemove(req.body.itemId);
  res.redirect("/inventory/category");
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, categories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find({}).exec(),
  ]);

  if (item === null) {
    const err = new Error("No se encontro el objeto");
    err.status = 404;
    return next(err);
  }

  for (const category of categories) {
    for (const itemCategory of item.category) {
      if (category._id.toString() === itemCategory._id.toString()) {
        category.checked = "true";
      }
    }
  }
  res.render("layout", {
    view: "item_form",
    title: "Actualizar objeto",
    data: { categories, item },
    error: null,
  });
});

exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  body("name", "El nombre debe contener minimo un caracter y maximo 30")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape(),
  body("description", "Debe ingresar una descripcion")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("inStock")
    .matches(/^[0-9]+$/)
    .withMessage(
      "El numero de objetos en stock debe ser un numero entero positivo"
    )
    .customSanitizer((val) => parseInt(val)),
  body("price")
    .matches(/^[0-9]+([.][0-9]+)?$/)
    .withMessage(
      "El numero de objetos en stock debe ser un numero entero positivo"
    )
    .customSanitizer((val) => parseFloat(val)),
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      inStock: req.body.inStock,
      category:
        typeof req.body.category === "undefined" ? [] : req.body.category,
      price: req.body.price,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const categories = await Category.find({}).exec();
      for (const category of categories) {
        if (item.category.includes(category._id)) {
          category.checked = "true";
        }
      }
      res.render("layout", {
        view: "item_form",
        title: "Actualizar objeto",
        data: { categories, item },
        error: errors.array(),
      });
      return;
    } else {
      const theItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(theItem.url);
    }
  }),
];
