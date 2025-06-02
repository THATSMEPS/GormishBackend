const prisma = require('../config/prisma');
const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getMenuByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId
      }
    });

    return successResponse(res, menuItems, 'Menu items retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving menu items', 500, error);
  }
};

const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountedPrice,
      isVeg,
      packagingCharges,
      cuisine,
      restaurantId,
      addons
    } = req.body;
    let imageUrl = null;

    // Handle image upload if file is provided
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('menu-items')
        .upload(`${restaurantId}/${fileName}`, req.file.buffer);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('menu-items')
        .getPublicUrl(`${restaurantId}/${fileName}`);
      
      imageUrl = publicUrl;
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        isVeg: isVeg === undefined ? true : isVeg,
        packagingCharges: parseFloat(packagingCharges),
        cuisine,
        imageUrl,
        restaurantId,
        addons: addons ? JSON.parse(JSON.stringify(addons)) : null
      }
    });

    return successResponse(res, menuItem, 'Menu item created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error creating menu item', 500, error);
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discountedPrice,
      isVeg,
      packagingCharges,
      cuisine,
      addons
    } = req.body;
    let imageUrl = updateData.imageUrl;

    // Handle image upload if new file is provided
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('menu-items')
        .upload(`${updateData.restaurantId}/${fileName}`, req.file.buffer);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('menu-items')
        .getPublicUrl(`${updateData.restaurantId}/${fileName}`);
      
      imageUrl = publicUrl;
    }

    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return errorResponse(res, 'Menu item not found', 404);
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        isVeg: isVeg === undefined ? existingItem.isVeg : isVeg,
        packagingCharges: parseFloat(packagingCharges),
        cuisine,
        addons: addons ? JSON.parse(JSON.stringify(addons)) : existingItem.addons
      }
    });

    return successResponse(res, updatedItem, 'Menu item updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating menu item', 500, error);
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return errorResponse(res, 'Menu item not found', 404);
    }

    // Delete image from storage if it exists
    if (existingItem.imageUrl) {
      const imagePath = existingItem.imageUrl.split('/').slice(-2).join('/');
      const { error } = await supabase.storage
        .from('menu-items')
        .remove([imagePath]);

      if (error) throw error;
    }

    await prisma.menuItem.delete({
      where: { id }
    });

    return successResponse(res, null, 'Menu item deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting menu item', 500, error);
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!menuItem) {
      return errorResponse(res, 'Menu item not found', 404);
    }

    return successResponse(res, menuItem, 'Menu item retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving menu item', 500, error);
  }
};

module.exports = {
  getMenuByRestaurantId,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemById
};
