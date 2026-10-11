
export function getProductPricing(product) {
  const now = new Date();

  const started =
    !product.offerStartDate ||
    now >= new Date(product.offerStartDate);

  const notExpired =
    !product.offerEndDate ||
    now <= new Date(product.offerEndDate);

  const offerIsValid =
    product.offerActive &&
    Number(product.offerPercent) > 0 &&
    started &&
    notExpired;

  const originalPrice = Number(product.price) || 0;

  const discountedPrice = offerIsValid
    ? Math.round(
        originalPrice *
          (1 - Number(product.offerPercent) / 100)
      )
    : originalPrice;

  return {
    originalPrice,
    discountedPrice,
    discountPercent: offerIsValid
      ? Number(product.offerPercent)
      : 0,
    hasOffer: offerIsValid,
  };
}
