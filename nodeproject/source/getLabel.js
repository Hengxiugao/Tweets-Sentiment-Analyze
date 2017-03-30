
var https = require('https');
var WriteFile = require('./WriteFile');
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

module.exports = function(codestring,callback) {
  // Build the post string from an object
  var sentences = [];
  sentences[0] = "And they say money can't buy you your happiness. How can I be happy when I can't even hut what I need?";
  sentences[1] = "Also,theres great ppl who helping m always during the distribution";
  sentences[2] = "you know you can always love the sun from a distance, sometimes feelings are so strong you burn yourself if you get too";
  sentences[3] = "GeekRemix and I'm still not over it, especially with that bald bastard";
  sentences[4] = "being emotionally attached to an idea has to have been the most self-destructive experience I've personally ever gone";
  sentences[5] = "Halfway through the episode my mother whispers, HE is a good looking man. LOL No kidding";
  var post_data = "{\"text_list\": [";
  for(var i=0;i<codestring.length;i++)
  {
    if(codestring[i].length<4) // TODO if null or short string, fill it with random contexts
      codestring[i] = sentences[randomIntInc(0,5)];
    if(i==codestring.length-1)
      post_data+= "\""+codestring[i]+"\"]}";
    else
      post_data+= "\""+codestring[i]+"\",";
  }
  // An object of options to indicate where to post to
  var post_options = {
      host: 'api.monkeylearn.com',
      path: '/v2/classifiers/cl_qkjxv9Ly/classify/?',
      method: 'POST',
      headers: {
        "Authorization": "token c2feb50f621e33c088b7e0d3a206926a8ccdff35",
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(post_data)
    }
  };

  // Set up the request
  var post_req = https.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        par = JSON.parse(chunk);
        var arr = [];

        for(var x in par['result']){
          arr.push(par['result'][x]);
        }
        console.log(chunk);
        var len = arr.length;
        for(var i=0;i<len;i++)
        {
          callback(arr[i][0]['label']);
          //WriteFile("label.txt",arr[i][0]['label']+"\n");
        }
      });
  });

  // post the data
  console.log(post_data);
  post_req.write(post_data);
  post_req.end();

};