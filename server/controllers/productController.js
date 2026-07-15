import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    let image = req.body.image;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });

      image = result.secure_url;
    }

    const product = await Product.create({
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      image,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.name = req.body.name || product.name;
    product.brand = req.body.brand || product.brand;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock || product.stock;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });

      product.image = result.secure_url;
    } else if (req.body.image) {
      product.image = req.body.image;
    }

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};