
var getFeatures = require('./getFeatures');
var Classifier = require('./Classifier');
var debug = 0;
function Bayesian_Train(samples,labels, eps)
{
	eps = 0.01; // for smoothing
	var possible_features = [];
	var numOfPossible_features = [];
	var feature_name = [];

	var possible_labels = [];
	var numOfPossible_labels=0;
	var numOfPossible_labels_each = [];
	var label_name = [];

	//console.log(samples);
	var i=0;
	for(var feature in samples[0]){
		feature_name[i] = feature;
		i++;
		//console.log("element="+feature);
	}
	var n = i;
	var m = samples.length;

	//Find all possible values for the label.
	i = 0;
	var possible = [];
	var count=0;
	for(i=0;i<m;i++)
	{
		if(numOfPossible_labels_each[labels[i]]==null)
		{
			possible_labels[count] = labels[i];
			numOfPossible_labels_each[labels[i]] = 1;
			count++;
		}else
			numOfPossible_labels_each[labels[i]] += 1;

	}
	numOfPossible_labels = count;
	if(debug==1)
	{
		console.log("num of features="+n+", samples="+m);
		console.log("num of labels="+numOfPossible_labels+", labels="+possible_labels+", each="+numOfPossible_labels_each['-1']+", "+numOfPossible_labels_each['0']+", "+numOfPossible_labels_each['1']);
	}
	//Find all possible values for every feature.
	for(i=0;i<n;i++)
	{
		var possible =[];
		//console.log("looking for feature:"+feature_name[i]);
		var count = 0;
		possible_features[i] = [];
		for(var j=0;j<m;j++)
		{
			var temp = samples[j][feature_name[i]]; // temp is the current feature[i]'s value
			if(possible[temp]==null)
			{
				possible[temp] = temp;
				possible_features[i][count] = temp;
				//console.log(temp+", ");
				count++;
			}
		}
		numOfPossible_features[i] = count;

	}
	if(debug==1)
		console.log("num of possible_features="+numOfPossible_features+", features:"+possible_features);
	var conditional_count = [];
	var conditional_possibility=[]
	for(i=0;i<n;i++)
	{
		conditional_count[i] = [];
		conditional_possibility[i] = [];
		for(var j=0;j<m;j++)
		{
			if(conditional_count[i][samples[j][feature_name[i]]]==null)
			{
				conditional_count[i][samples[j][feature_name[i]]] = [];
				conditional_possibility[i][samples[j][feature_name[i]]] = [];
				conditional_count[i][samples[j][feature_name[i]]][labels[j]] = 1;
			}
			else
				if (conditional_count[i][samples[j][feature_name[i]]][labels[j]]==null)
					conditional_count[i][samples[j][feature_name[i]]][labels[j]] = 1;
				else
					conditional_count[i][samples[j][feature_name[i]]][labels[j]] ++;
		}
	}
	for(i=0;i<n;i++)
	{
		for(var f=0;f<numOfPossible_features[i];f++)
		{
			for(var c=0;c<numOfPossible_labels;c++)
			{
				if(conditional_count[i][possible_features[i][f]][possible_labels[c]]==null)
				{
					conditional_count[i][possible_features[i][f]][possible_labels[c]] = eps; // for smoothing the non-exist value in training data.
				}
				conditional_possibility[i][possible_features[i][f]][possible_labels[c]] = conditional_count[i][possible_features[i][f]][possible_labels[c]] / numOfPossible_labels_each[possible_labels[c]]
				
				if(debug==1)
					console.log("C(f"+i+"="+possible_features[i][f]+",c="+possible_labels[c]+")="+
						conditional_count[i][possible_features[i][f]][possible_labels[c]]+
						", p="+conditional_possibility[i][possible_features[i][f]][possible_labels[c]]);
					
			}
		}
		//console.log();
	}
	var returnresult = [];
	returnresult[0] = conditional_possibility;
	returnresult[1] = possible_labels;
	return returnresult;
}

module.exports = function (sentences, labels, eps, callback)
{
	var features = [];	
	var m = sentences.length;
	//console.log(sentences);
	/*
	sentences[0] = "And they say money can't buy you your happiness. How can I be happy when I can't even hut what I need?";
	sentences[1] = "Also,theres great ppl who helping m always during the distribution";
	sentences[2] = "you know you can always love the sun from a distance, sometimes feelings are so strong you burn yourself if you get too";
	sentences[3] = "GeekRemix and I'm still not over it, especially with that bald bastard";
	sentences[4] = "being emotionally attached to an idea has to have been the most self-destructive experience I've personally ever gone";
	sentences[5] = "Halfway through the episode my mother whispers, HE is a good looking man. LOL No kidding";
	*/
	
	/*
	labels[0] = -1;
	labels[1] = 1;
	labels[2] = 1;
	labels[3] = -1;
	labels[4] = -1;
	labels[5] = 0;
	*/

	for(var i=0;i<m;i++)
	{
		features[i] = getFeatures(sentences[i]);
	}
	eps  = 0.01;
	var train_result = Bayesian_Train(features,labels,eps);
	var conditional_possibility = train_result[0];
	var possible_labels = train_result[1];
	
	//console.log(conditional_possibility[0][-5]);
	if(debug==1) console.log(JSON.stringify(conditional_possibility[0]));
	callback(conditional_possibility,possible_labels,eps/m);
	/*
	var test_string = "Halfway through the episode my mother whispers, HE is a good looking man. LOL No kidding";
	var nb_label = Classifier(conditional_possibility,possible_labels,test_string,eps/m);
	console.log("label="+possible_labels[nb_label]);
	*/
};

