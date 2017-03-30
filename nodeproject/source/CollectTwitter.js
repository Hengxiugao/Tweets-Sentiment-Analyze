/*
  Using regular expression to process twitter
*/

var Twit = require('twit');
var T = new Twit({
    consumer_key:         'lmsfuq8AEmwwUSSsMBCNPmjEH',
    consumer_secret:      'pT3IqfHNj3yJBP2mMSqm5WnM0lvnId9ORb6QAq0AKeD2fUheKy',
    access_token:         '442647033-gdgBx1h8XSnFen0qaEbivD0F9o9Vw1hCzIALnJEL',
    access_token_secret:  'MOSHfyDWwkf81r5ngGZbpfbtBUUBIkKFQl9AzaargEVDt'
});

function processTwitter(string)
{
  var len = string.length;
  var at = string.indexOf('@');

  var re = new RegExp(/RT\s@\w+:/);
  var index = string.search(re);
  while(index>=0)
  {
    string = string.replace(re,"");
    index = string.search(re);
  }

  re = new RegExp(/@\w+/);
  index = string.search(re);
  while(index>=0)
  {
    string = string.replace(re,"");
    index = string.search(re);
  }

  re = new RegExp(/#[\w\:\\\/\-\=\+\@\!\$\%\^\&\*\(\)]*/);
  index = string.search(re);
  while(index>=0)
  {
    string = string.replace(re,"");
    index = string.search(re);
  }

  re = new RegExp(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/);
  index = string.search(re);
  while(index>=0)
  {
    string = string.replace(re,"");
    index = string.search(re);
  }

  re = new RegExp(/[\"\\\/\n\(\)\:\[\]]/);
  index = string.search(re);
  while(index>=0)
  {
    string = string.replace(re,"");
    index = string.search(re);
  }

  re = new RegExp(/[\uD83C-\uDBFF\uDC00-\uDFFF]/);
  index = string.search(re);
  while(index>=0)
  {
    string = string.replace(re,"");
    index = string.search(re);
  }



  return string.trim();
}
var sentences = [];
  sentences[0] = "And they say money can't buy you your happiness. How can I be happy when I can't even hut what I need?";
  sentences[1] = "Also,theres great ppl who helping m always during the distribution";
  sentences[2] = "you know you can always love the sun from a distance, sometimes feelings are so strong you burn yourself if you get too";
  sentences[3] = "GeekRemix and I'm still not over it, especially with that bald bastard";
  sentences[4] = "being emotionally attached to an idea has to have been the most self-destructive experience I've personally ever gone";
  sentences[5] = "Halfway through the episode my mother whispers, HE is a good looking man. LOL No kidding";

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}
module.exports = function (context, count, callback)
{
  //console.log("in get twitter data func, context="+context);
  T.get('search/tweets', { q: context+' since:2011-11-11', count: count }, function(err, data, response) {
    
    for(var i=0;i<count;i++)
    {
      //console.log("i="+i+","+data['statuses'][i]);
      var text = "";
      if(data['statuses']===undefined||data['statuses'][i]===undefined)
        text = sentences[randomIntInc(0,5)];
      else
        text = data['statuses'][i]['text'];
      //var lang = data['statuses'][i]['user']['lang'];
      //if(lang==='en')
      //{
        console.log(text);
        text = processTwitter(text);
        console.log(text);
        callback(text,i);
      //}
    }
  });
};