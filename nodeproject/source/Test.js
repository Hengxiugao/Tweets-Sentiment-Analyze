var Classifier = require('../source/Classifier');
module.exports = function (conditional_possibility, possible_labels, sentences, labels ,eps)
{
	var m = sentences.length;
	var n = conditional_possibility.length;
	console.log("m="+m+", n="+n+", sentences=");
	console.log(possible_labels[2]);
	//console.log(sentences);
	//console.log(labels);
	var correct = 0;
	for(var i=0;i<m;i++)
	{
		var result_label = Classifier(conditional_possibility, possible_labels, sentences[i],eps);
		if(possible_labels[result_label]==labels[i])
		{
			correct++;
			//console.log("correct="+correct);
			//console.log("sentence="+sentences[i]);
			//console.log("label="+labels[i]);
		}else
		{
			//console.log(sentences[i]);
			//console.log("test data label"+labels[i]+", classifier result="+possible_labels[result_label]);
		}
	}
	console.log("Accuracy="+correct/m);

};