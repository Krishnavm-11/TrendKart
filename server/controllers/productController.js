
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// Check whether an offer is currently active
const isOfferActive = (product) => {
  const now = new Date();

  const startDate = product.offerStartDate
    ? new Date(product.offerStartDate)
    : null;

  const endDate = product.offerEndDate
    ? new Date(product.offerEndDate)
    : null;

  return (
    product.offerActive === true &&
    Number(product.offerPercent) > 0 &&
    Number(product.offerPercent) <= 100 &&
    (!startDate || startDate <= now) &&
    (!endDate || endDate >= now)
  );
};

// Add discount details to a product response
const formatProduct = (product) => {
  const data = product.toObject
    ? product.toObject()
    : { ...product };

  const hasActiveOffer = isOfferActive(data);

  const originalPrice = Number(data.price) || 0;

  const discountedPrice = hasActiveOffer
    ? Math.round(
        originalPrice *
          (1 - Number(data.offerPercent) / 100) *
          100
      ) / 100
    : originalPrice;

  return {
    ...data,
    hasActiveOffer,
    discountedPrice,
  };
};

// Create a product
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

    res.status(201).json(formatProduct(product));
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: error.message || "Failed to create product",
    });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products.map(formatProduct));
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: error.message || "Failed to fetch products",
    });
  }
};

// Get one product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(formatProduct(product));
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: error.message || "Failed to fetch product",
    });
  }
};

// Update product, including offer details
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Update normal product fields when provided
    if (req.body.name !== undefined) {
      product.name = req.body.name;
    }

    if (req.body.brand !== undefined) {
      product.brand = req.body.brand;
    }

    if (req.body.description !== undefined) {
      product.description = req.body.description;
    }

    if (req.body.price !== undefined) {
      const price = Number(req.body.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          message: "Product price must be a valid positive number",
        });
      }

      product.price = price;
    }

    if (req.body.category !== undefined) {
      product.category = req.body.category;
    }

    if (req.body.stock !== undefined) {
      const stock = Number(req.body.stock);

      if (!Number.isFinite(stock) || stock < 0) {
        return res.status(400).json({
          message: "Stock must be a valid non-negative number",
        });
      }

      product.stock = stock;
    }

    // Save offer percentage
    if (req.body.offerPercent !== undefined) {
      const offerPercent = Number(req.body.offerPercent);

      if (
        !Number.isFinite(offerPercent) ||
        offerPercent < 0 ||
        offerPercent > 100
      ) {
        return res.status(400).json({
          message: "Offer percentage must be between 0 and 100",
        });
      }

      product.offerPercent = offerPercent;
    }

    // Save whether the offer is enabled
    if (req.body.offerActive !== undefined) {
      if (typeof req.body.offerActive === "boolean") {
        product.offerActive = req.body.offerActive;
      } else if (req.body.offerActive === "true") {
        product.offerActive = true;
      } else if (req.body.offerActive === "false") {
        product.offerActive = false;
      } else {
        return res.status(400).json({
          message: "offerActive must be true or false",
        });
      }
    }

    // Save offer start date
    if (req.body.offerStartDate !== undefined) {
      if (req.body.offerStartDate === null || req.body.offerStartDate === "") {
        product.offerStartDate = null;
      } else {
        const startDate = new Date(req.body.offerStartDate);

        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            message: "Invalid offer start date",
          });
        }

        product.offerStartDate = startDate;
      }
    }

    // Save offer end date
    if (req.body.offerEndDate !== undefined) {
      if (req.body.offerEndDate === null || req.body.offerEndDate === "") {
        product.offerEndDate = null;
      } else {
        const endDate = new Date(req.body.offerEndDate);

        if (Number.isNaN(endDate.getTime())) {
          return res.status(400).json({
            message: "Invalid offer end date",
          });
        }

        product.offerEndDate = endDate;
      }
    }

    // Check the offer date range
    if (
      product.offerStartDate &&
      product.offerEndDate &&
      product.offerEndDate < product.offerStartDate
    ) {
      return res.status(400).json({
        message: "Offer end date must be after the start date",
      });
    }

    // Update product image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });

      product.image = result.secure_url;
    } else if (req.body.image !== undefined) {
      product.image = req.body.image;
    }

    // Save changes to MongoDB
    const updatedProduct = await product.save();

    res.status(200).json(formatProduct(updatedProduct));
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: error.message || "Failed to update product",
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product deleted",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: error.message || "Failed to delete product",
    });
  }
};
