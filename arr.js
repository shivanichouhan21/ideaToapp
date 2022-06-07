const ID = ["3","123"];

const casses = [
    {
        caseName: "case 1",
        date: "2021-05-4",
        id: "3",
        user: [
           
        ]
    },
    {
        caseName: "case 2",
        date: "2021-05-4",
        id: "1234",
        user: [
            { name: "Alina", id: "3" },
            { name: "Alex", id: "4" }
        ]
    },
    {
        caseName: "case 3",
        date: "2021-05-4",
        id: "123",
        user: []
    }
];

let filterData = casses.filter(item => ID.includes(item.id));
console.log(filterData,"cassescasses");

//Our number.
var number = 1000;

//The percent that we want to get.
//i.e. We want to get 50% of 120.
var percentToGet = 20;

//Calculate the percent.
var percent = (percentToGet / 100) * number;

//Alert it out for demonstration purposes.
console.log(percentToGet + "% of " + number + " is " + percent);

//The result: 50% of 120 is 60



// const utils = require('../utils');

// const ProjectFeatures = require('../models/project_features');
// const Coupans  = require('../models/coupans');
// const Project = require('../models/projects');
// const sequelize = require('../database');
// const { Op, QueryTypes } = require('sequelize');
// const { to, ReS, ReE, ValidationErrors } = require('../services/util.service');
// const { check, body, validationResult } = require('express-validator');
// const Templates = require('../models/templates');

//search active coupans
exports.searchActiveCoupans = async function(req, res){
    try{
        //let addions = await Addions.findAll({where:{is_active_as:1}});
        //return ReS(res, {addons : addions});
    }catch(err) {
        return ReE(res, {message : err.message}, 200);
    }
}

//apply coupans
exports.applyCoupans = async function(req, res){

    await check('coupan_id', "Coupan not found!").notEmpty().run(req);
    //await check('client_id', "Please log in to apply coupan").notEmpty().run(req);
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return ReE(res,  errors.array(), 200);
    }

    let coupanId = req.body.coupan_id;
    let client_id = req.body.client_id;
    let currency_id = req.body.currency_id;

    try{
        let coupan = await Coupans.findOne({where:{coupan_id:coupanId}});
        if(!coupan){
            return ReE(res, {message : "Coupan not found"}, 200);
        }

        if(coupan.coupan_only_for){
            if(coupan.coupan_only_for != client_id) {
                return ReE(res, {message : "You are not authorize to use this coupan!"}, 200);
            }
        }
        if(coupan.currency){
            if(coupan.currency != currency_id){
                return ReE(res, {message : "Coupan not applicable on selected currency!"}, 200);
            }
        }
        if(coupan.Template){
            if(typeof(req.body.temp_id) == 'undefined' || req.body.temp_id == null){
                return ReE(res, {message : "Coupan not applicable on selected template!"}, 200);
            }
            if(typeof(req.body.temp_id) != 'undefined' && req.body.temp_id[0] != coupan.Template)
                return ReE(res, {message : "Coupan not applicable on selected template!"}, 200);
        }
        if(coupan.platforms){
            if(typeof(req.body.platforms) == 'undefined' || req.body.platforms == null){
                return ReE(res, {message : "Coupan not applicable on selected platforms!"}, 200);
            }
            let plts = req.body.platforms;
            let cplt = coupan.platforms.split(',');
            plts.sort(function (a, b) {
                return a - b;
            });
            cplt.sort(function (a, b) {
                return a - b;
            });
            if(plts.join(',').replace(/\s/g, '') != cplt.join(',').replace(/\s/g, '')){
               return ReE(res, {message : "Coupan not applicable on selected platforms!"}, 200);
            }
        }
        if(coupan.features_ids){
            if(typeof(req.body.features_ids) == 'undefined' || req.body.features_ids == null){
                return ReE(res, {message : "Coupan not applicable on selected features!"}, 200);
            }
            let features = req.body.features_ids;
            let cfeatures = coupan.features_ids.split(',');
            for (var i = 0; i < features.length; i++) {
                if(!cfeatures.includes(features[i])){
                    break;
                    return ReE(res, {message : "Coupan not applicable on selected features!"}, 200);
                }
            };
        }

        if(client_id){
            if(coupan.coupan_only_for && coupan.coupan_only_for != 0 && coupan.coupan_only_for != client_id){
                return ReE(res, {message : "You are not eligible to use this coupan"}, 200);
            }
        }
        //let totalProjectsQry = "SELECT count(proj_id) as total_projects FROM `projects` WHERE proj_coupon_id = :proj_coupon_id";
        let totalProjectsQry = "SELECT count(ideacard_id) as total_projects FROM `i2p_ideacard` WHERE proj_coupon_id = :proj_coupon_id";
        let totalProjects = await sequelize.query(
            totalProjectsQry,
          {
            replacements: { proj_coupon_id: coupanId },
            type: QueryTypes.SELECT
          }
        );
        if(totalProjects){
            if(totalProjects[0].total_projects >= coupan.coupan_uses_limit){
                return ReE(res, {message : "Max users limit of this coupan is reached"}, 200);
            }
        }

        //let myProjectsQry = "SELECT count(proj_id) as my_projects FROM `projects` WHERE proj_coupon_id = :proj_coupon_id AND proj_client_id = :proj_client_id";
        if(client_id){
            let myProjectsQry = "SELECT count(ideacard_id) as my_projects FROM `i2p_ideacard` WHERE proj_coupon_id = :proj_coupon_id AND proj_client_id = :proj_client_id";
            let myProjects = await sequelize.query(
                myProjectsQry,
            {
                replacements: { proj_coupon_id: coupanId, proj_client_id: client_id },
                type: QueryTypes.SELECT
            }
            );
            if(myProjects){
                if(myProjects[0].my_projects >= coupan.coupan_per_user_limit){
                    return ReE(res, {message : "You already used this coupan!"}, 200);
                }
            }
        }

        return ReS(res, { "message" : "Coupan applied successfully" });

        //return ReS(res, {addons : addions});
    }catch(err) {
        return ReE(res, {message : err.message}, 200);
    }

    return ReE(res, {message : "Could not applied coupan"}, 200);
}

// search coupan
exports.searchCoupan = async function(req, res){
    let search = req.body.search;
    let client_id = req.body.client_id;
    let currency_id = req.body.currencyid;
    let temp_slug = req.body.tempslug;
    
    if(client_id){
        try{
            let template = await Templates.findOne({where : {temp_slug : temp_slug}});
            if(template){
                
                let myProjectsQry = "SELECT `coupan_id`, `coupan_code`, `coupan_title`, `coupan_desc`, `coupan_disc_perc`, `coupan_max_disc`, `coupan_per_user_limit`, `coupan_uses_limit`, `coupan_valid_upto`, `is_active_coupan`, `coupan_created_on`, `coupan_only_for`, `is_display_globally`, `currency`, `template` AS `Template`, `platforms`, `features_ids`, `is_fixed_cost`, `hrs_disc` FROM `coupans` AS `coupans` WHERE `coupans`.`coupan_code` LIKE :search AND coupan_valid_upto >= CURDATE() AND `coupans`.`is_display_globally` = 1 AND `coupans`.`is_active_coupan` = 1 UNION ALL SELECT `coupan_id`, `coupan_code`, `coupan_title`, `coupan_desc`, `coupan_disc_perc`, `coupan_max_disc`, `coupan_per_user_limit`, `coupan_uses_limit`, `coupan_valid_upto`, `is_active_coupan`, `coupan_created_on`, `coupan_only_for`, `is_display_globally`, `currency`, `template`, `hrs_disc` AS `Template`, `platforms`, `features_ids`, `is_fixed_cost` FROM `coupans` AS `coupans` WHERE `coupans`.`is_display_globally` = 0 AND `coupans`.`is_active_coupan` = 1 AND coupan_valid_upto >= CURDATE() AND coupan_only_for =:client_id ";
                let coupans = await sequelize.query(
                    myProjectsQry,
                {
                    replacements: { search : search, currentDate : new Date(getCurrentDateTime()), client_id : client_id },
                    type: QueryTypes.SELECT
                }
                );

                ////
                for (var i = 0; i < coupans.length; i++) {
                    //coupans[i].dataValues.coupan_max_cost_static =coupans[i].dataValues.coupan_max_disc;
                    coupans[i].coupan_max_cost_static =coupans[i].coupan_max_disc;
                }
                /////
                return ReS(res, {coupans : coupans});
            }
        }catch(err) {
            return ReE(res, {message : err.message}, 200);
        }
    }else{
        try{
            let template = await Templates.findOne({where : {temp_slug : temp_slug}});
            if(template){
            let coupans = await Coupans.findAll({where:{coupan_code:{ [Op.like] : search}, coupan_valid_upto: {[Op.gte]:new Date(getCurrentDateTime())},  is_active_coupan:1,  is_display_globally : 1}});
                ////
                for (var i = 0; i < coupans.length; i++) {
                    coupans[i].coupan_max_cost_static = coupans[i].coupan_max_disc;
                }
                /////
                return ReS(res, {coupans : coupans});
            }
        }catch(err) {
            return ReE(res, {message : err.message}, 200);
        }
    }
}

// Check coupan availability
exports.checkCoupanAvailability = async function(req, res){
    await check('coupan_id', "Coupan not found!").notEmpty().run(req);
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return ReE(res,  errors.array(), 200);
    }

    let coupanId = req.body.coupan_id;
    let client_id = req.body.client_id;
    let currency_id = req.body.currencyid;
    let temp_slug = req.body.tempslug;

    try{
        let template = await Templates.findOne({where : {temp_slug : temp_slug}});
        let temp_id ='';
        let coupan='';
        if(template){
            temp_id = template.temp_id;
            coupan = await Coupans.findOne({where:{coupan_id:coupanId,template:temp_id}});
        }
        
        if(!coupan){
            coupan = await Coupans.findOne({where:{coupan_id:coupanId}});
        }
        ////
        if(coupan) {
            if(coupan.coupan_only_for){
                if(coupan.coupan_only_for != client_id) {
                    return ReE(res, {message : "You are not authorize to use this coupan!"}, 200);
                }
            }
            if(coupan.currency){
                if(coupan.currency != currency_id){
                    return ReE(res, {message : "Coupan not applicable on selected currency!"}, 200);
                }
            }
            if(coupan.Template && coupan.Template != template.temp_id){
                return ReE(res, {message : "Coupan not applicable on selected template!"}, 200);
            }
            if(coupan.platforms){
                if(typeof(req.body.platforms) == 'undefined' || req.body.platforms == null){
                    return ReE(res, {message : "Coupan not applicable on selected platforms!"}, 200);
                }
                let plts = req.body.platforms;
                let cplt = coupan.platforms.split(',');
                plts.sort(function (a, b) {
                    return a - b;
                });
                cplt.sort(function (a, b) {
                    return a - b;
                });
                if(plts.join(',').replace(/\s/g, '') != cplt.join(',').replace(/\s/g, '')){
                   return ReE(res, {message : "Coupan not applicable on selected platforms!"}, 200);
                }
            }
            if(coupan.features_ids){
                if(typeof(req.body.features_ids) == 'undefined' || req.body.features_ids == null){
                    return ReE(res, {message : "Coupan not applicable on selected features!"}, 200);
                }
                let features = req.body.features_ids;
                let cfeatures = coupan.features_ids.split(',');
                for (var i = 0; i < features.length; i++) {
                    if(!cfeatures.includes(features[i])){
                        break;
                        return ReE(res, {message : "Coupan not applicable on selected features!"}, 200);
                    }
                };
               
            }
            coupan.coupan_max_cost_static = coupan.coupan_max_disc;
        }
        /////
        if(!coupan){
            return ReE(res, {message : "Coupan not found"}, 200);
        }
        let totalProjectsQry = "SELECT count(ideacard_id) as total_projects FROM `i2p_ideacard` WHERE proj_coupon_id = :proj_coupon_id";
        let totalProjects = await sequelize.query(
            totalProjectsQry,
          {
            replacements: { proj_coupon_id: coupanId },
            type: QueryTypes.SELECT
          }
        );
        if(totalProjects){
            if(totalProjects[0].total_projects >= coupan.coupan_uses_limit){
                return ReE(res, {message : "Max users limit of this coupan is reached"}, 200);
            }
        }

        if(client_id){
            let myProjectsQry = "SELECT count(ideacard_id) as my_projects FROM `i2p_ideacard` WHERE proj_coupon_id = :proj_coupon_id AND proj_client_id = :proj_client_id";
            let myProjects = await sequelize.query(
                myProjectsQry,
            {
                replacements: { proj_coupon_id: coupanId, proj_client_id: client_id },
                type: QueryTypes.SELECT
            }
            );
            if(myProjects){
                if(myProjects[0].my_projects >= coupan.coupan_per_user_limit){
                    return ReE(res, {message : "You already used this coupan"}, 200);
                }
            }
        }

        return ReS(res, { "message" : "Coupan applied successfully" });

        //return ReS(res, {addons : addions});
    }catch(err) {
        return ReE(res, {message : err.message}, 200);
    }

    return ReE(res, {message : "Could not applied coupan"}, 200);
}

function getCurrentDateTime() {
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    return year + "-" + month + "-" + date;
}

var specific_date = new Date('2022-05-26');
var current_date = new Date();
if(current_date.getTime() < specific_date.getTime())
{
    console.log('current_date date is grater than specific_date')
}
else
{
    console.log('current_date date is lower than specific_date')
}


var foo = function(){
    for(var i =0; i < 1000; i++){
        for(var j = 0; j < 1000;j++){
            var x = i * j;
            var y = x * x;
        }
    }
};

var t1 = millis();
foo();
var t2 = millis();
var delta = t2-t1;
println("Time to run foo: " + delta + " ms");