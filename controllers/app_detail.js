var db = require('../config/connection');
const { resonseCode, errresonseCode } = require('./resonseCode');
const { addCouponCode } = require('./coupan');

let convertToInstallment = (maxPrice, totalHour, callback) => {
    let totalWeek = totalHour / 40
    callback(totalWeek)
}




let addCoupon = async (couponCode, totalHour, totalPrice, feature_id, platform_id, tamp_id, callback) => {

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

        let objResult = plate_resp[0]
        console.log(objResult, "objResult");


        let obj = {}
        obj.minusDiscount = 1
        var discount = (objResult.coupan_disc_perc / 100) * totalPrice;
        if (objResult.is_active_coupan != 1) {
            obj.minusDiscount = 0
        }
        var specific_date = new Date(objResult.coupan_valid_upto);
        var current_date = new Date();
        if (current_date.getTime() > specific_date.getTime()) {
            obj.minusDiscount = 0
        } if (objResult.is_display_globally != 1) {
            obj.minusDiscount = 0
        }
        if (objResult.is_special != 1) {
            obj.minusDiscount = 0
        } else {
            let str = objResult.features_ids
            let strFeatureToarr = str.split(", ")
            console.log(strFeatureToarr, "strFeatureToarr");
            let platformStr = objResult.platforms
            let strTamplate = objResult.Template
            let strcurrency = objResult.currency
            if (!str) {
                callback(false)
            } if (!platformStr) {
                callback(false)
            } if (!strTamplate) {
                callback(false)
            } if (!strcurrency) {

            }

            // const arr2 = ['pizza', 'cake', 'cola'];

            // const containsAll = feature_id.every(element => {
            //     return arr2.includes(element);
            // });

            // console.log(containsAll)
        }

        if (objResult.is_fixed_cost != 0) {
            if (obj.minusDiscount == 1) {
                obj.totalPrice = totalPrice - objResult.coupan_max_disc
                obj.minusDiscount = 2
            }
        }
        if (objResult.coupan_max_disc >= discount) {
            if (obj.minusDiscount == 1) {
                obj.totalPrice = totalPrice - discount
                obj.minusDiscount = 2
            }
        } if (objResult.coupan_max_disc < discount) {
            if (obj.minusDiscount == 1) {
                obj.totalPrice = totalPrice - objResult.coupan_max_disc
                obj.minusDiscount = 2
            }

        }
        if (objResult.hrs_disc && obj.minusDiscount == 2) {
            totalHour = totalHour - objResult.hrs_disc
        }

        if (obj.minusDiscount == 1) {
            obj.totalPrice = totalPrice
        }


        callback({ totalPrice: totalPrice, totalHour: totalHour });

    } else {
        callback(false)
    }

}



let PlateformData = async (platformId, id, feature_id, totalHour, totalPrice, changeDecimal, callback) => {
    let installment = 0
    let plateformQuery = `SELECT * FROM platforms`;
    let result = platformId.map(i => Number(i));

    if (platformId.length > 1) {
        try {
            const plate_resp = await new Promise((resolve, reject) => {
                db.query(plateformQuery, (err, plaform_data) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    } else {
                        resolve(plaform_data);
                    }
                });
            });
            let filterData = await plate_resp.filter(item => result.includes(item.plt_id));
            totalPrice = totalPrice + (totalPrice * (filterData.length - 1) / 2);
            totalHour = totalHour + (totalHour * (filterData.length - 1) / 2);

            let platWeek = totalHour / 40;
            changeDecimal = parseInt(platWeek) + 1;
            // console.log(changeDecimal, "changeDecimal");
            installment = totalPrice / changeDecimal;
            callback(
                { temp_id: id, platform_id: platformId, feature_id: feature_id, totalHour: totalHour, installment: installment, totalPrice: totalPrice, totalWeek: changeDecimal }
            );
        } catch (err_1) {
            // console.log(err_1);
            callback(
                false
            );
        }
    }
}

let featureData = async (id, feature_id, callback) => {
    let changeDecimal = 0
    let totalPrice = 0
    let installment = 0
    let totalHour = 0
    let ftotalHour = 0
    let ftotalPrice = 0
    Promise.all(
        await feature_id.map(async (element) => {
            let featureQuery = `SELECT * FROM features where feature_id="${element}"`
            return new Promise((resolve, reject) => {
                db.query(featureQuery, (err, features) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(features);
                });
            }).then((features) => {
                if (features.length > 0) {
                    ftotalHour = features[0].feature_base_hrs
                    ftotalPrice = features[0].feature_base_cost
                    let ftotalWeek = ftotalHour / 40
                    changeDecimal += parseInt(ftotalWeek) + 1
                    totalPrice += ftotalPrice
                    installment = totalPrice / changeDecimal
                }
            }).catch((err) => { console.log(err); });
        })
    ).then((resp) => {
        // console.log(ftotalHour, installment, totalPrice, changeDecimal);
        callback(
            { temp_id: id, feature_id: feature_id, totalHour: totalHour + ftotalHour, installment: installment, totalPrice: totalPrice, totalWeek: changeDecimal }
        )

    }).catch((err) => {
        console.log(err);
        callback(false)
    })
}

exports.i2p_templates = (req, res) => {
    let id = req.body.temp_id;
    let feature_id = req.body.features_ids
    let platformId = req.body.plateform_ids
    let couponCode = req.body.coupon_code
    let client_id = req.body.client_id
    let currency_id = req.body.currency_id
    console.log(req.body, "query");
    const query = `SELECT *
    FROM i2p_templates 
    INNER JOIN template_features ON i2p_templates.temp_id = template_features.tf_template_id
    INNER JOIN features ON template_features.tf_feature_id = features.feature_id
    where temp_id=${id}`;
    let featureCheck = false
    let platformCheck = false
    let respObj = { temp_id: id }
    db.query(query, async function (err, result) {
        if (err) {
            res.json({
                code: 400,
                msg: err
            })
        } else {
            let totalHour = 0
            let totalPrice = 0
            await result.map(element => {
                // console.log(totalPrice, "totalPrice");
                totalHour += element.feature_base_hrs
                totalPrice = element.temp_cost
            });
            let installment = 0;
            let changeDecimal = 0

            let data = totalHour / 40
            changeDecimal = parseInt(data) + 2;
            console.log(totalHour, data, changeDecimal);
            installment = totalPrice / changeDecimal;
            respObj.totalHour = totalHour
            respObj.installment = installment
            respObj.totalPrice = totalPrice
            respObj.totalWeek = changeDecimal
            respObj.feature_id = feature_id
            respObj.platform_id = platformId
            if (feature_id && platformId.length > 1) {
                console.log("if condition");
                featureCheck = true
                platformCheck = true
                await featureData(id, feature_id, async (detaResp) => {
                    
                    if (detaResp) {
                        
                        await PlateformData(platformId, id, feature_id, totalHour, totalPrice, changeDecimal, async (platResp) => {
                            if (platResp) {
                                
                                respObj.totalHour = detaResp.totalHour + platResp.totalHour
                                respObj.totalPrice = detaResp.totalPrice + platResp.totalPrice
                                respObj.totalWeek = detaResp.totalWeek + platResp.totalWeek
                                respObj.installment = detaResp.totalPrice / detaResp.totalWeek

                            } else {
                                respObj.feature_id = feature_id
                                respObj.totalHour = detaResp.totalHour + totalHour
                                respObj.installment = detaResp.installment + installment
                                respObj.totalPrice = detaResp.totalPrice + totalPrice
                                respObj.totalWeek = detaResp.totalWeek + changeDecimal

                            }
                        })
                    } else {
                        return res.json({ code: 400, msg: "something went wrong!" })
                    }
                })

            }

            if (feature_id && !featureCheck) {
                console.log("only feature");
                await featureData(id, feature_id, async (detaResp) => {
                    if (detaResp) {
                        respObj.feature_id = feature_id
                        respObj.totalHour = detaResp.totalHour + respObj.totalHour
                        respObj.installment = detaResp.installment + respObj.installment
                        respObj.totalPrice = detaResp.totalPrice + respObj.totalPrice
                        respObj.totalWeek = detaResp.totalWeek + respObj.totalWeek
                        // console.log(respObj, "respObj");
                        // res.json(
                        //     respObj
                        // )
                    } else {
                        return res.json({ code: 400, msg: "something went wrong!" })
                    }
                })
            } if (platformId.length > 1 && !platformCheck) {
                await PlateformData(platformId, id, feature_id, respObj.totalHour, respObj.totalPrice, respObj.totalWeek, async (platResp) => {
                    if (platResp) {
                        // console.log(platResp, "platResp");
                        respObj.platform_id = platformId
                        respObj.totalPrice = platResp.totalPrice
                        respObj.totalHour = platResp.totalHour
                        respObj.totalWeek = platResp.totalWeek
                        respObj.installment = platResp.installment

                    } else {
                        return res.json({ code: 400, msg: "something went wrong!" })
                    }
                })
            }
            if (couponCode) {
                return addCouponCode(res, couponCode, feature_id, platformId, client_id, currency_id, id, respObj.totalPrice, respObj.totalHour, respObj.totalWeek);
            }
            res.json(
                respObj
            )

        }
    });
}



