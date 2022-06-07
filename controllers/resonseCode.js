module.exports.errresonseCode = function (res, err, code, log = null) { // Error Web Response
    if (typeof err == 'object' && typeof err.message != 'undefined') {
      err = err.message;
    }
    if (typeof code !== 'undefined') res.statusCode = code;
    if(log == null){
      return res.json({ success: false, error: err });
    }else{
      return res.json({ success: false, error: err, log : log });
    }
  };
  
  module.exports.resonseCode = function (res, data, code) { // Success Web Response
    let send_data = { };
  
    if (typeof data == 'object') {
      send_data = Object.assign(data, send_data);//merge the objects
    }
  
    if (typeof code !== 'undefined') res.statusCode = code;
    return res.json(send_data)
  };
  