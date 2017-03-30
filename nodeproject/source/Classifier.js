var getFeatures = require('./getFeatures');
module.exports = function (conditional_possibility, possible_labels, sentence,eps)
{
	var feature_name = [];
	len = possible_labels.length;
	features = getFeatures(sentence);
	var i=0;
	for(var feature in features){
		feature_name[i] = feature;
		i++;
	}
	var n = i;
	var max = 0;
	var max_label = 0;
	//console.log(features);
	for(var c=0;c<len;c++)
	{
		possibility = 1;
		//console.log("For c="+possible_labels[c]);
		for(i=0;i<n;i++)
		{
			var fea = features[feature_name[i]];
			var cla = possible_labels[c];
			var mu=1;
			//console.log("fea="+fea+", cla="+cla);
			if(fea===undefined||cla===undefined||conditional_possibility[i]===undefined||
				conditional_possibility[i][fea]===undefined||conditional_possibility[i][fea][cla]===undefined)
				mu = eps;
			else
				mu = conditional_possibility[i][fea][cla];
			possibility *= mu;
			//console.log("i="+i+",possibility="+possibility+"f="+fea+", c="+cla+", con="+mu);
		}
		//console.log("possibility="+possibility);
		if(max<possibility)
		{
			max = possibility;
			max_label = c;
		}
	}
	return max_label;
};