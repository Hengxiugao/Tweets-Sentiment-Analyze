var express = require('express');
var router = express.Router();
var sentiment = require('../lib/index');
var fs = require('fs');

var WriteFile = require('../source/WriteFile');
var liner = require('../source/liner');
var liner_class = require('../source/liner');
var liner_test = require('../source/liner');
var afinn = require('../build/AFINN.json');
var CollectTwitter = require('../source/CollectTwitter');
var getLabel = require('../source/getLabel');
var Train = require('../source/Train');
var Test = require('../source/Test');
var Classifier = require('../source/Classifier');
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Sentiment Analysis | NLP project'});
});


router.get('/base', function(req, res, next) {
	var test_sentence = req.query.sentence;
	var test_hidden = req.query.test_hidden;
	var test_para = req.query.test_parameter;
	var score = 0;
	if(test_sentence!==null)
	{
		var result = sentiment(test_sentence);
		score = result['score'];
		if(score>0)
			score = "positive";
		else if(score<0)
			score = "negative";
		else
			score = "neutral";
	}else
	{
		score="";
	}
	if(test_hidden!==undefined)
	{
		var source = fs.createReadStream(__dirname+'/../test_data.txt');
		source.pipe(liner_test);
		var count = 0;
		liner_test.on('readable', CallbackBastTest);
	}
	res.render('base', { title: 'Sentiment Analysis | NLP project', score:score,sentence:test_sentence});
});
var test_sentences=[];
var test_labels = [];
var test_count=0;
function CallbackBastTest()
{
	var filecount = 82400;
	var correct = 0;
	var line;
	while (line = liner_test.read())
	{
		if(line.lastIndexOf("positive")>0)
		{
			test_sentences[test_count] = line.substring(0,line.lastIndexOf("positive")-2);
			test_labels[test_count] = 1;
		}else if(line.lastIndexOf("negative")>0)
		{
			test_sentences[test_count] = line.substring(0,line.lastIndexOf("negative")-2);
			test_labels[test_count] = -1;
		}else
		{
			test_sentences[test_count] = line.substring(0,line.lastIndexOf("neutral")-2);
			test_labels[test_count] = 0; 
		}
			
		if(test_count==filecount-1)
		{	
			for(var i=0;i<filecount;i++)
			{
				var result = sentiment(test_sentences[i]);
				var test_result = result['score'];
				if(test_result==0&&test_labels[i]==0)
					correct++;
				else if(test_result*test_labels[i]>0)
					correct++;
				else
				{
					//console.log(test_sentences[i]);
					//console.log("test_result="+test_result+", label="+test_labels[i]);
				}
			}
			console.log("Accuracy="+(correct/filecount));
		}
		test_count ++;
	}
}

router.get('/final', function(req, res, next) {
	var collect_para = req.query.collect_parameter;
	var train_para = req.query.train_parameter;
	var test_para = req.query.test_parameter;
	var class_sentence = req.query.class_sentence;

	var collect_hidden = req.query.collect_hidden;
	var train_hidden = req.query.train_hidden;
	var class_hidden = req.query.class_hidden;
	var test_hidden = req.query.test_hidden;

	var view_sentence = req.query.sentence;
	var view_label = req.query.class_label;

	var collectcount = 50;
    var intervalCount = 0;
    var intervalMax = 5;
    var words = [];

    var class_label;
    var sentence;
    console.log("collect_hidden="+collect_hidden+",train_hidden="+train_hidden+", class_hidden="+class_hidden);
	function timeoutCallback() {
		console.log("TICK");
        if(intervalCount<intervalMax)
        {
        	console.log(words[intervalCount]);
			CollectTwitter(words[intervalCount],collectcount,CollectTwitterCallback);
			intervalCount++;
        }
    }

	if(collect_hidden!==undefined) //collect data from twitter and label them
	{
		console.log("collect_para="+collect_para);
		
		var word_count=0;
		for(var word in afinn)
		{
			words[word_count] = word;
			word_count++;
		}
		setInterval(timeoutCallback, 4000);
		
	}else if(train_hidden!==undefined)  //Train the data
	{
		console.log("train_para="+train_para);

		//var filecount = collectcount * intervalMax;
		//console.log(filecount);
		var source = fs.createReadStream(__dirname+'/../train_data.txt');//Train data here
		source.pipe(liner);
		var count = 0;
		liner.on('readable', readfileCallbackTrain);
	}else if(class_hidden!==undefined)  //Class one sentence using the trained classifier.
	{
		fs.readFile(__dirname+'/../classifier.txt',"ascii",readFileCallback);
		
		function readFileCallback(err,data){
			if(err) throw err;
			result = processClassifierFile(data);
			conditional_possibility = result[0];
			possible_labels = result[1];
			eps = result[2];
			
			var test_string = "Halfway through the episode my mother whispers, HE is a good looking man. LOL No kidding";
			sentence = class_sentence;
			if(sentence==null) sentence = test_string;
			var nb_label = Classifier(conditional_possibility,possible_labels,sentence,eps);
			if(possible_labels[nb_label]>0)
				class_label = "positive";
			else if(possible_labels[nb_label]<0)
				class_label = "negative";
			else 
				class_label = "neutral";
			console.log("label="+class_label);
		
		}
	}else if(test_hidden!==undefined)  //Test the classifier
	{
		//var filecount = collectcount * intervalMax;
		var source = fs.createReadStream(__dirname+'/../test_data.txt');//Test data here
		source.pipe(liner_test);
		var count = 0;
		liner_test.on('readable', readfileCallbackTest);
	}else if(view_sentence!==undefined&&view_label!==undefined)
	{
		console.log("sentence="+view_sentence+", class_label="+view_label);
	}
	var label_count = 0;
	var twitter_text = [];
	function CollectTwitterCallback(text,count)
	{
		//console.log(count+", "+text);
		
		twitter_text[count] = text;
		count++;
		if(count>=collectcount)
		{
			//console.log(twitter_text);
			label_count = 0;
			getLabel(twitter_text,getLabelCallback);
		}

		function getLabelCallback(label)
		{
			console.log(twitter_text[label_count]+"    "+label);
			WriteFile(__dirname+"/../train_data_other.txt",twitter_text[label_count]+"  "+label+"\n");
			label_count++;
		}
		//console.log("CollectTwitter callback="+text);
		//WriteFile("twitter.txt",text+'\n');
	}
	var sentences = [];
	var labels = [];
	function processClassifierFile(data)
	{
		var lines = [];
		var conditional_possibility=[];
		var possible_labels=[];
		var eps;
		var line;
		var i=0;
		var f=0;
		var c=0;
		lines = data.split("\n");
		for(var count in lines)
		{
			line = lines[count];
			if(line.indexOf('i=')>=0)
			{
				i = line.substring(line.indexOf('i=')+2,line.length);
				conditional_possibility[i] = [];
					//console.log("i="+i);
			}else if(line.indexOf("f=")>=0)
			{
				f = line.substring(line.indexOf('f=')+2,line.indexOf(","));
				c = line.substring(line.indexOf('c=')+2,line.lastIndexOf(","));
					
				if(conditional_possibility[i][f]==null)
					conditional_possibility[i][f] = [];
				if(conditional_possibility[i][f][c]==null)
					conditional_possibility[i][f][c] = [];
				conditional_possibility[i][f][c] = line.substring(line.indexOf('p=')+2,line.length);
				//console.log("f="+f+",c="+c+",");
			}else if(line.indexOf('pro=')>=0)
			{
				line = line.substring(line.indexOf('=')+1,line.length);
				var label_count = 0;
				while(line.indexOf(',')>=0)
				{
					possible_labels[label_count] = line.substring(0,line.indexOf(','));
					line = line.substring(line.indexOf(',')+1,line.length);
					label_count++;
				}
				possible_labels[label_count] = line.substring(0,line.length);;
			}else if(line.indexOf('eps=')>=0){
				eps = line.substring(line.indexOf('=')+1,line.length);
				
			}
		}
		var result = [];
		result[0] = conditional_possibility;
		result[1] = possible_labels;
		result[2] = eps;
		return result;
	}

	function readfileCallbackTrain()
	{
		var line;
		//console.log("in train function, filecount="+filecount);
		var filecount = 98650;
		while (line = liner.read())
		{
			if(line.lastIndexOf("positive")>0)
			{
				sentences[count] = line.substring(0,line.lastIndexOf("positive")-2);
				labels[count] = 1;
			}else if(line.lastIndexOf("negative")>0)
			{
				sentences[count] = line.substring(0,line.lastIndexOf("negative")-2);
				labels[count] = -1;
			}else
			{
				sentences[count] = line.substring(0,line.lastIndexOf("neutral")-2);
				labels[count] = 0; 
			}
			count ++;
			if(count==filecount-1)
			{
				Train(sentences,labels,0.01,TrainCallback);
			}
		}
		function TrainCallback(conditional_possibility,possible_labels,eps)
		{
			len = conditional_possibility.length;
			for(var i=0;i<len;i++)
			{
				//console.log("i="+i);
				WriteFile("classifier.txt","i="+i+"\n");
				for(var f in conditional_possibility[i])
				{
					for(var c in conditional_possibility[i][f])
					{
						//console.log("f="+f+",c="+c+", p="+conditional_possibility[i][f][c]);
						WriteFile("classifier.txt","f="+f+",c="+c+", p="+conditional_possibility[i][f][c]+"\n");
					}
				}
			}
			WriteFile("classifier.txt","pro="+possible_labels+"\neps="+eps);
			console.log("Train complete");
			
		}
	}
	var test_sentences=[];
	var test_labels = [];
	var test_count=0;
	function readfileCallbackTest()
	{
		var filecount = 82400;
		var line;
		while (line = liner_test.read())
		{
			if(line.lastIndexOf("positive")>0)
			{
				test_sentences[test_count] = line.substring(0,line.lastIndexOf("positive")-2);
				test_labels[test_count] = 1;
			}else if(line.lastIndexOf("negative")>0)
			{
				test_sentences[test_count] = line.substring(0,line.lastIndexOf("negative")-2);
				test_labels[test_count] = -1;
			}else
			{
				test_sentences[test_count] = line.substring(0,line.lastIndexOf("neutral")-2);
				test_labels[test_count] = 0; 
			}
			
			if(test_count==filecount-1)
			{
				Test(conditional_possibility,possible_labels,test_sentences,test_labels,0.01);
			}
			test_count ++;
		}
	}

	res.render('final', { title: 'Sentiment Analysis | NLP project', sentence:view_sentence,label:view_label});
});

module.exports = router;