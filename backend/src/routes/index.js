const express = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const authenticate = require("../middleware/authenticate");
const requirePermission = require("../middleware/requirePermission");
const userRoutes = require("./userRoutes");
const roleRoutes = require("./roleRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const brandRoutes = require("./brandRoutes");
const customerRoutes = require("./customerRoutes");
const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use( "/customers", customerRoutes);



module.exports = router;