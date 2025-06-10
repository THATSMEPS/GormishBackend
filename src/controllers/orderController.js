const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const createOrder = async (req, res) => {
  try {
    const { 
      restaurantId,
      customerId, 
      items, 
      paymentType,
      customerNotes,
      distance,
      address
    } = req.body;

    // Calculate items amount and GST
    let itemsAmount = 0;
    const orderItems = [];

    // Process each item
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem) {
        return errorResponse(res, `Menu item not found: ${item.menuItemId}`, 404);
      }

      const totalPrice = (menuItem.discountedPrice || menuItem.price) * item.quantity;
      itemsAmount += totalPrice;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        basePrice: menuItem.price,
        totalPrice,
        addons: item.addons || null
      });
    }

    // Calculate GST (assuming 5%)
    const gst = itemsAmount * 0.05;
    const deliveryFee = distance * 10; // ₹10 per km
    const totalAmount = itemsAmount + gst + deliveryFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        restaurantId,
        customerId: customerId,
        status: 'pending',
        paymentType,
        customerNotes,
        distance,
        address,
        itemsAmount,
        gst,
        deliveryFee,
        totalAmount,
        items: {
          create: orderItems
        },
        orderType
      },
      include: {
        items: true
      }
    });

    // Emit socket.io event for order update
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
        customer: true,
        deliveryPartner: true
      }
    });

    const io = req.app.get('io');
    io.emit('order:new', fullOrder);

    return successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Error creating order', 500, error);
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['pending', 'preparing', 'ready'] } // Filter active orders
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: true,
        customer: true,
        deliveryPartner: true
      }
      
    });

    return successResponse(res, orders, 'Orders retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving orders', 500, error);
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: true,
        customer: true,
        deliveryPartner: true
      }
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving order', 500, error);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Received status update request for order ${id} with status: ${status}`);

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      console.log(`Order with id ${id} not found`);
      return errorResponse(res, 'Order not found', 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    console.log(`Order ${id} status updated to: ${updatedOrder.status}`);

    // Emit socket.io event for order update
    const fullOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
        customer: true,
        deliveryPartner: true
      }
    });

    const io = req.app.get('io');
    io.emit('order:update', fullOrder);

    return successResponse(res, updatedOrder, 'Order status updated successfully');
  } catch (error) {
    console.error('Error updating order status:', error);
    return errorResponse(res, 'Error updating order status', 500, error);
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        restaurant: true,
        deliveryPartner: true
      },
      orderBy: {
        placedAt: 'desc'
      }
    });

    return successResponse(res, orders, 'Customer orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving customer orders:', error);
    return errorResponse(res, 'Error retrieving customer orders', 500, error);
  }
};

const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { in: ['pending', 'preparing', 'ready'] } // Filter active orders
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        customer: true,
        deliveryPartner: true
      },
      orderBy: {
        placedAt: 'desc'
      }
    });

    return successResponse(res, orders, 'Restaurant orders retrieved successfully');
  } catch (error) {
    console.error('Error retrieving restaurant orders:', error);
    return errorResponse(res, 'Error retrieving restaurant orders', 500, error);
  }
};
const getRestaurantOrderHistory = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    
    if (restaurantId !== req.user.id) {
      return errorResponse(res, 'Unauthorized: You do not have access to this restaurant', 403);
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { in: ['dispatch', 'rejected'] } // History orders
      },
      include: {
        items: { include: { menuItem: true } },
        customer: true,
        deliveryPartner: true
      },
      orderBy: { placedAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    return successResponse(res, orders, 'Restaurant order history retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving restaurant order history', 500, error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getCustomerOrders,
  getRestaurantOrders,
  getRestaurantOrderHistory
};
