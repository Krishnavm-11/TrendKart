import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    offerPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    offerActive: {
      type: Boolean,
      default: false,
    },

    offerStartDate: {
      type: Date,
      default: null,
    },

    offerEndDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.methods.hasValidOffer = function () {
  const now = new Date();

  const started =
    !this.offerStartDate || now >= this.offerStartDate;

  const notExpired =
    !this.offerEndDate || now <= this.offerEndDate;

  return (
    this.offerActive === true &&
    this.offerPercent > 0 &&
    this.offerPercent <= 100 &&
    started &&
    notExpired
  );
};

productSchema.methods.getDiscountedPrice = function () {
  if (!this.hasValidOffer()) {
    return this.price;
  }

  return Math.round(
    this.price * (1 - this.offerPercent / 100)
  );
};

export default mongoose.model("Product", productSchema);