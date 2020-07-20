const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

const URL = "http://localhost:3000/orders/";

router.get("/", (req, res, next) => {
  Order.find()
    .select("_id quantity")
    .populate("product", "name price")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            quantity: doc.quantity,
            product: doc.product,
            request: {
              type: "GET",
              url: URL + doc._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post("/", (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
        request: {
          type: "GET",
          url: URL + result._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/:orderId", (req, res, next) => {
  Order.findById(req.params.orderId)
    .select("quantity")
    .populate("product", "name price")
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: URL + req.params.orderId,
        },
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.delete("/:orderId", (req, res, next) => {
  Order.remove({ _id: req.params.orderId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Order deleted",
        request: {
          type: "POST",
          url: URL,
          body: { productId: "ID", quantity: "Number" },
        },
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;
