var natural = require('natural');
var sentiment = require(__dirname+'/../lib/index');
var pos = require('pos');
module.exports = function(sentence)
{
	var numOfWRB = 0;
	var numOfMD = 0;
	var numOfRB = 0;
	var feature = [];
	var tags = [];

	tokenizer = new natural.RegexpTokenizer({pattern: /[\s\'\"\.\,\!\?]/});
	tokens = tokenizer.tokenize(sentence);

	var tokens_sentence="";
	for(var i=0;i<tokens.length;i++)
	{
		if(tokens[i]=='t')
			tokens[i] = "not";
		else if(tokens[i]=='m')
			tokens[i] = "am";
		else if(tokens[i]=='d')
			tokens[i] = "would";
		tokens_sentence+=tokens[i]+" ";
	}
	//console.log("tokens_sentence="+tokens_sentence);

	var result = sentiment(tokens_sentence);
	var score = result['score'];
	var itemscore = result['itemscore'];
	var tokens = result['tokens'];
	
	/*POS Tagging*/
	
	
	var words = new pos.Lexer().lex(tokens_sentence);
	var taggedWords = new pos.Tagger().tag(words);
	for (i in taggedWords) {
	    var taggedWord = taggedWords[i];
	    var word = taggedWord[0];
	    var tag = taggedWord[1];
	    tags[i] = tag;
	    if(tag=='WRB') numOfWRB++;
	   	else if(tag=='MD') numOfMD++;
	   	else if(tag=='RB') numOfRB++;
	    //console.log("word="+word+",tag="+tag+", token="+tokens[i]);
	}
	//console.log("\nRB="+ numOfRB+ ", WRB="+numOfWRB +", MD="+ numOfMD+"\n");
	var best_score=0;
	var best_word;
	var best_word_i=0;
	var pre_best_score=0;
	var pre_best_word;

	var second_score=0;
	var second_word;
	var second_word_i=0;
	var pre_second_score=0;
	var pre_second_word;

	var worst_score=0;
	var worst_word;
	var worst_word_i=0;
	var pre_worst_score=0;
	var pre_worst_word;

	var sworst_score=0;
	var sworst_word;
	var sworst_word_i=0;
	var pre_sworst_score=0;
	var pre_sworst_word;

	var len = itemscore.length;

	for (var i = len - 1; i >= 0; i--) {
		if(best_score<=itemscore[i])
		{
			best_score = itemscore[i];
			best_word = tokens[i];
			best_word_i = i;
		}

	};
	pre_best_score = itemscore[best_word_i-1];
	pre_best_word = tokens[best_word_i-1];
	for (var i = len - 1; i >= 0; i--) {
		if(best_word!=tokens[i]&&second_score<=itemscore[i])
		{
			second_score = itemscore[i];
			second_word = tokens[i];
			second_word_i = i;
		}

	};
	pre_second_score = itemscore[second_word_i - 1];
	pre_second_word = tokens[second_word_i - 1];

	for (var i = len - 1; i >= 0; i--) {
		if(worst_score>=itemscore[i])
		{
			worst_score = itemscore[i];
			worst_word = tokens[i];
			worst_word_i = i;
		}

	};
	pre_worst_score = itemscore[worst_word_i-1];
	pre_worst_word = tokens[worst_word_i-1];
	for (var i = len - 1; i >= 0; i--) {
		if(worst_word!=tokens[i]&&sworst_score>=itemscore[i])
		{
			sworst_score = itemscore[i];
			sworst_word = tokens[i];
			sworst_word_i = i;
		}

	};

	pre_sworst_score = itemscore[sworst_word_i - 1];
	pre_sworst_word = tokens[sworst_word_i - 1];

	var best_word_tag = tags[best_word_i];
	var worst_word_tag = tags[worst_word_i];
	var pre_best_word_tag = tags[best_word_i-1];
	var pre_worst_word_tag = tags[worst_word_i-1];

	if(best_score==0)
	{
		best_word = "empty";
		pre_best_score = 0;
		pre_best_word = "empty";
		best_word_tag = "empty";
		pre_best_word_tag = "empty";
	}
	if(second_score==0)
	{
		second_word = "empty";
		pre_second_score = 0;
		pre_second_word = "empty";
	}
		
	if(worst_score==0)
	{
		worst_word = "empty";
		pre_worst_score = 0;
		pre_worst_word = "empty";
		worst_word_tag = "empty";
		pre_worst_word_tag = "empty";
	}
	if(sworst_score==0)
	{
		sworst_word = "empty";
		pre_sworst_score = 0;
		pre_sworst_word = "empty";
	}
	//console.dir(result['score']);        // Score: -2, Comparative: -0.666
	//console.dir(result);
	
	features = {score, best_score, best_word_tag, pre_best_score, pre_best_word_tag, 
					  worst_score, worst_word_tag, pre_worst_score, pre_worst_word_tag,
					  numOfRB, numOfMD, numOfWRB};
	
	/*
	console.log("\nbest: score="+best_score+", word="+best_word+", tag="+best_word_tag+
				"\npre best: score="+pre_best_score+", word="+pre_best_word+",tag="+pre_best_word_tag+
				"\nsecond: score="+second_score+", word="+second_word+
				"\npre second: score="+pre_second_score+", word="+pre_second_word);

	console.log("\nworst: score="+worst_score+", word="+worst_word+",tag="+worst_word_tag+
			    "\npre worst: score="+pre_worst_score+", word="+pre_worst_word+",tag="+pre_worst_word_tag+
			    "\nsecond worst: score="+sworst_score+", word="+sworst_word+
			    "\npre second worst: score="+pre_sworst_score+", word="+pre_sworst_word+"\n");
	*/
	return features;

};