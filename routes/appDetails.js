


var express = require('express');
var router = express.Router();
const {i2p_templates,addCouponCode}=require("../controllers/app_detail")

// Home page route.
// router.post('/addCouponCode',addCouponCode )
router.post("/templates",i2p_templates)
// router.get("/findById/:id",findById)
// router.put("/update/:idUsers",update)
// router.delete("/delete/:idUsers",deletes)

module.exports = router

// mailto:raja123@mailinator.com/12345678