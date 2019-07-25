exports.getIp = function(){
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let IPv4 = '127.0.0.1';
  for (let key in interfaces) {
    interfaces[key].forEach(function(details){
        const { family, internal } = details;
      if (family == 'IPv4' && internal == false  ) {
        IPv4 = details.address;
      }
    });
  }
  return IPv4;
}