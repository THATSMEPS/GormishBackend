const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        area: true
      }
    });
    return successResponse(res, restaurants, 'Restaurants retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving restaurants', 500, error);
  }
};

const getRestaurantsByArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    const restaurants = await prisma.restaurant.findMany({
      where: { areaId },
      include: {
        area: true
      }
    });
    return successResponse(res, restaurants, 'Area restaurants retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving area restaurants', 500, error);
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        area: true
      }
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    return successResponse(res, restaurant, 'Restaurant retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving restaurant', 500, error);
  }
};

const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      cuisines,
      vegNonveg,
      hours,
      areaId,
      address,
      banners,
      applicableTaxBracket
    } = req.body;

    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { mobile },
          { email }
        ]
      }
    });

    if (existingRestaurant) {
      return errorResponse(res, 'Restaurant with this mobile or email already exists', 400);
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        mobile,
        email,
        cuisines,
        vegNonveg,
        hours: hours ? JSON.parse(JSON.stringify(hours)) : {},
        address: address ? JSON.parse(JSON.stringify(address)) : {},
        banners: banners || [],
        applicableTaxBracket: applicableTaxBracket ? parseFloat(applicableTaxBracket) : null,
        areaId
      }
    });

    return successResponse(res, restaurant, 'Restaurant created successfully', 201);  } catch (error) {
    console.error('Restaurant creation error:', error);
    return errorResponse(res, `Error creating restaurant: ${error.message}`, 500, error);
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      mobile,
      email,
      cuisines,
      vegNonveg,
      hours,
      address,
      banners,
      applicableTaxBracket
    } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        mobile,
        email,
        cuisines,
        vegNonveg,
        hours: hours ? JSON.parse(JSON.stringify(hours)) : restaurant.hours,
        address: address ? JSON.parse(JSON.stringify(address)) : restaurant.address,
        banners: banners || restaurant.banners,
        applicableTaxBracket: applicableTaxBracket ? parseFloat(applicableTaxBracket) : restaurant.applicableTaxBracket
      }
    });

    return successResponse(res, updatedRestaurant, 'Restaurant updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating restaurant', 500, error);
  }
};

const updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approval } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: { approval }
    });

    return successResponse(res, updatedRestaurant, 'Restaurant approval status updated');
  } catch (error) {
    return errorResponse(res, 'Error updating restaurant approval', 500, error);
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    await prisma.restaurant.delete({
      where: { id }
    });

    return successResponse(res, null, 'Restaurant deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting restaurant', 500, error);
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantsByArea,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  updateApprovalStatus,
  deleteRestaurant
};
