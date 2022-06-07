const { resonseCode, errresonseCode } = require('./resonseCode');
var db = require('../config/connection');

module.exports.addCouponCode = async (res,couponCode, features_ids, plateform_ids, client_id, currency_id, temp_id,totalPrice,totalHour,totalWeek) => {
    // const {  } = req.body;
    // let totalPrice = req.body.totalPrice;
    // let totalHour = req.body.totalHour;
    const query = `SELECT * FROM coupans where coupan_code='${couponCode}'`;
    const plate_resp = await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
                return reject(err);
            } else {

                resolve(result);
            }
        });
    });
    if (plate_resp.length > 0) {
        // return resonseCode(res, {coupans : {"coupans":99}});
        let objResult = plate_resp[0]
        // console.log(objResult, "objResult");
        var specific_date = new Date(objResult.coupan_valid_upto);
        var current_date = new Date();

        // console.log(typeof (totalPrice), "ssss");
        var discount = (objResult.coupan_disc_perc / 100) * totalPrice;
        // console.log(typeof (totalPrice),discount, "ssss");
        if (objResult.is_active_coupan != 1) {
            return errresonseCode(res, { message: "Coupan is not Active" }, 200);
        }

        if (current_date.getTime() > specific_date.getTime()) {
            return errresonseCode(res, { message: "Coupan is not Valid" }, 200);
        } if (objResult.is_display_globally == 1) {
            return errresonseCode(res, { message: "You are not authorize to use this coupan!" }, 200);
        }
        if (objResult.is_special != 1) {
            return errresonseCode(res, { message: "You are not to use this coupan!" }, 200);
        } else {
            if (objResult.is_special == 1) {
                let featureStr = objResult.features_ids
                // let strFeatureToarr = str.split(", ")
                // console.log(strFeatureToarr, "strFeatureToarr");
                let platformStr = objResult.platforms
                let strTamplate = objResult.Template
                let strcurrency = objResult.currency
                if (!featureStr) {
                    return errresonseCode(res, { message: "Features Not exists in database" }, 200);
                } if (!platformStr) {
                    return errresonseCode(res, { message: "platform Not exists in database" }, 200);
                }
                if (!strTamplate) {
                    return errresonseCode(res, { message: "Tamplate Not exists in database" }, 200);
                }
                if (!strcurrency) {
                    return errresonseCode(res, { message: "currency Not exists in database" }, 200);
                } else {
                    let strFeatureToarr = featureStr.split(", ")
                    let strplatformToarr = platformStr.split(", ")
                    console.log(features_ids, "strplatformToarr");
                   
                    const matchPlatform = await plateform_ids.every(element => {
                        return strplatformToarr.includes(element);
                    });
                    
                    // console.log(matchPlatform, "matchPlatform");
                    if (features_ids == undefined) {
                        // const matchfeatures = await features_ids.every(element => {
                        //     return strFeatureToarr.includes(element);
                        // });
                        return errresonseCode(res, { message: "Coupan not applicable on selected features!" }, 200);
                    } if (!matchPlatform) {
                        return errresonseCode(res, { message: "Coupan not applicable on selected platforms!" }, 200);

                    } if (strcurrency != currency_id) {
                        return errresonseCode(res, { message: "Coupan not applicable on selected currency!" }, 200);

                    } if (strTamplate != temp_id) {
                        return errresonseCode(res, { message: "Coupan not applicable on selected Tamplate!" }, 200);

                    }
                    if (objResult.hrs_disc) {
                        totalHour = totalHour - objResult.hrs_disc
                    }
                    if (objResult.is_fixed_cost == 1) {
                        // console.log("fixed price");
                        // console.log(totalPrice,"ll");
                        totalPrice = totalPrice - objResult.coupan_max_disc
                        // console.log(totalPrice,"totalPrice");
                        // return resonseCode(res, { coupans: totalPrice, totalHour: totalHour });
                    }
                    console.log(discount,totalPrice,"discount");
                    if (objResult.coupan_max_disc <= discount && objResult.is_fixed_cost != 1) {
                        console.log("fixed coupan_max_disc is greater");
                        totalPrice = totalPrice - objResult.coupan_max_disc
                        // return resonseCode(res, { coupans: totalPrice, totalHour: totalHour });
                    } if (objResult.coupan_max_disc > discount && objResult.is_fixed_cost != 1) {
                        console.log("fixed coupan_max_disc is less then", objResult.coupan_max_disc);

                        totalPrice = totalPrice -discount
                    }
               
                    let data = totalHour / 40
                    changeDecimal = parseInt(data) + 1;
                    console.log(totalHour, data, changeDecimal);
                    installment = totalPrice / changeDecimal;
                    return resonseCode(res, {temp_id:temp_id, totalHour: totalHour,installment:installment, totalPrice: totalPrice, totalWeek:changeDecimal,platform_id:plateform_ids,features_id:features_ids,coupon_code:couponCode});
                }
            } else {
                if (objResult.hrs_disc) {
                    totalHour = totalHour - objResult.hrs_disc
                }
                if (objResult.is_fixed_cost == 1) {
                    console.log("fixed price");
                    totalPrice = totalPrice - objResult.coupan_max_disc
                    // return resonseCode(res, { coupans: totalPrice, totalHour: totalHour });
                }
                if (objResult.coupan_max_disc >= discount) {
                    totalPrice = totalPrice - discount
                    // return resonseCode(res, { coupans: totalPrice, totalHour: totalHour });
                } if (objResult.coupan_max_disc < discount) {
                    totalPrice = totalPrice - objResult.coupan_max_disc
                    // return resonseCode(res, { coupans: totalPrice, totalHour: totalHour });

                }   
                let data = totalHour / 40
                changeDecimal = parseInt(data) + 1;
                console.log(totalHour, data, changeDecimal);
                installment = totalPrice / changeDecimal;
                return resonseCode(res, {temp_id:temp_id, totalHour: totalHour,installment:installment, totalPrice: totalPrice, totalWeek:changeDecimal,platform_id:plateform_ids,features_id:features_ids,coupon_code:couponCode});
            }
        }

    } else {
        return errresonseCode(res, { message: "Coupan not found" }, 200);
    }
}