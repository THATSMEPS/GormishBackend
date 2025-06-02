const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.orderReview.findMany({
      include: {
        order: true,
        customer: true,
        restaurant: true,
        deliveryPartner: true
      }
    });
    return successResponse(res, reviews, 'Reviews retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving reviews', 500, error);
  }
};

const createReview = async (req, res) => {
  try {
    const { orderId, reviewText } = req.body;
    const customerId = req.user.id;

    // Check if order exists and belongs to the customer
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId
      }
    });

    if (!order) {
      return errorResponse(res, 'Order not found or does not belong to you', 404);
    }

    // Check if review already exists for this order
    const existingReview = await prisma.orderReview.findFirst({
      where: { orderId }
    });

    if (existingReview) {
      return errorResponse(res, 'Review already exists for this order', 400);
    }

    const review = await prisma.orderReview.create({
      data: {
        reviewText,
        orderId,
        customerId,
        restaurantId: order.restaurantId,
        deliveryPartnerId: order.deliveryPartnerId
      },
      include: {
        order: true,
        customer: true,
        restaurant: true,
        deliveryPartner: true
      }
    });

    return successResponse(res, review, 'Review created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error creating review', 500, error);
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewText } = req.body;
    const customerId = req.user.id;

    const existingReview = await prisma.orderReview.findFirst({
      where: {
        id,
        customerId
      }
    });

    if (!existingReview) {
      return errorResponse(res, 'Review not found or does not belong to you', 404);
    }

    const review = await prisma.orderReview.update({
      where: { id },
      data: { reviewText },
      include: {
        order: true,
        customer: true,
        restaurant: true,
        deliveryPartner: true
      }
    });

    return successResponse(res, review, 'Review updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating review', 500, error);
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const existingReview = await prisma.orderReview.findFirst({
      where: {
        id,
        customerId
      }
    });

    if (!existingReview) {
      return errorResponse(res, 'Review not found or does not belong to you', 404);
    }

    await prisma.orderReview.delete({
      where: { id }
    });

    return successResponse(res, null, 'Review deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting review', 500, error);
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview
};
