var fs = require('fs');
module.exports = function (file,string)
{
  fs.open(file,'a',0644,function(e,fd){
    if(e) throw e;
    fs.write(fd,string,function(e){
        if(e) throw e;
        fs.closeSync(fd);
    });
  });
};