(function(){
	var app = angular.module('after10years',[]);
	
	app.controller('mainCtrl', function(){
		var mainCtrl = this;
		mainCtrl.title = 'After 10 years';
		mainCtrl.author = 'vomvoru';
		mainCtrl.saveData = function(){
			console.log([planBoardCtrl.dream, planBoardCtrl.planCollection]);
			console.log(angular.toJson([planBoardCtrl.dream, planBoardCtrl.planCollection]));
			window.prompt('아래 텍스트를 복사하세요.', angular.toJson([planBoardCtrl.dream, planBoardCtrl.planCollection]));
		}
		mainCtrl.loadData = function(){
			var loadedData = window.prompt();
			if(loadedData){
				var loadedPlanCollection = JSON.parse(loadedData);
				planBoardCtrl.dream = loadedPlanCollection[0];
				planBoardCtrl.planCollection = loadedPlanCollection[1];
			}
		}
		mainCtrl.print = function(){
			window.print()
		};
	});

	var nowYears = (new Date()).getFullYear();
	var planCollection = [];
	
	var emptyPlans = [];
	for(var i = 0 ; i < 12 * 1 ; i++){
		emptyPlans.push({
			value: '',
			size: 1
		});
	}

	for(var years = nowYears ; years <= nowYears+10 ; years++){
		planCollection.push({
			years: years,
			plans: _.cloneDeep(emptyPlans)
		})
	}

	
	var planBoardCtrl
	app.controller('planBoardCtrl', ['$scope', '$sce', function ($scope, $sce) {
		planBoardCtrl = this;

		var editor = new wysihtml5.Editor("wysihtml5-editor", {
		  toolbar:     "wysihtml5-editor-toolbar",
		  parserRules: wysihtml5ParserRules
		});
		
		editor.on("load", function() {
		  var composer = editor.composer;
		  composer.selection.selectNode(editor.composer.element.querySelector("h1"));
		});

		planBoardCtrl.planCollection = planCollection;

		planBoardCtrl.closeEditor = function(html){
			if(window.confirm('저장하지 않고 닫으시겠습니까?')){
				planBoardCtrl.showEditor = false;
			}
		}

		planBoardCtrl.cleanPlan = function(html){
			if(!window.confirm('계획을 삭제하시겠습니까?')){
				return;
			}

			var editType = planBoardCtrl.editType;

			if(editType == 'plan'){
				var editYearIndex = planBoardCtrl.editYearIndex;
				var editPlanIndex = planBoardCtrl.editPlanIndex;
				var plans = planBoardCtrl.planCollection[editYearIndex].plans;
				var planObj = plans[editPlanIndex];

				planObj.value = '';
				for(var i = planObj.size - 1 ; i >= 0 ; i--){
					plans[editPlanIndex - i].size = 1;
				}

				adjustmentPlanBoardSize(plans);
			}

			if(editType == 'dream'){

				planBoardCtrl.dream = '';
			}

			

			planBoardCtrl.showEditor = false;
		}

		planBoardCtrl.trustAsHtml = function(html){
			return $sce.trustAsHtml(html);
		}

		planBoardCtrl.openEditor = function($event, yearIndex, $index){
			var planObj = planBoardCtrl.planCollection[yearIndex].plans[$index];

			editor.clear();
			editor.setValue(planObj.value);

			planBoardCtrl.editType = 'plan';
			planBoardCtrl.editYearIndex = yearIndex;
			planBoardCtrl.editPlanIndex = $index;

			planBoardCtrl.showEditor = true;
		}

		planBoardCtrl.openEditorDream = function(){
			editor.clear();
			editor.setValue(planBoardCtrl.dream);
			planBoardCtrl.editType = 'dream';
			planBoardCtrl.showEditor = true;
		}

		planBoardCtrl.startPlan = function($event, yearIndex, $index){
			planBoardCtrl.startPlanIndex = $index;
		}



		planBoardCtrl.editPlan = function(){
			var editYearIndex = planBoardCtrl.editYearIndex;
			var editPlanIndex = planBoardCtrl.editPlanIndex;
			var editType = planBoardCtrl.editType;

			if(editType == 'plan'){
				var startPlanIndex = planBoardCtrl.startPlanIndex;

				var plans = planBoardCtrl.planCollection[editYearIndex].plans;
				var planObj = plans[editPlanIndex];

				planObj.value = editor.getValue();

				adjustmentPlanBoardSize(plans);

				for(var i = startPlanIndex ; i < editPlanIndex ; i++){
					plans[i].size = 0;
				}
				planObj.size += (editPlanIndex - startPlanIndex);
			}

			if(editType == 'dream'){

				planBoardCtrl.dream = editor.getValue();
			}
			

			planBoardCtrl.showEditor = false;
		}

		function adjustmentPlanBoardSize(plans){

			var needAddLine = false;
			var needRemoveLine = true;

			var len = plans.length;

			for(var i = len-1 ; i > len-12 ; i--){
				if(len < 0){
					break;
				}

				if(plans[i].value && plans[i].value != ''){
					needAddLine = true;
					break;
				}
			}

			if(needAddLine){
				for(var i = 0 ; i < 12 * 1 ; i++){
					plans.push({
						value: '',
						size: 1
					});
				}
			}else if(len/12 >= 2){
				len = plans.length;

				for(var i = len-1 ; i > len-24 ; i--){
					if(len < 0){
						break;
					}

					if(plans[i].value && plans[i].value != ''){
						needRemoveLine = false;
						break;
					}
				}

				if(needRemoveLine){
					for(var i = 0 ; i < 12 * 1 ; i++){
						plans.pop({});
					}
				}
			}
		}
	}])
})();
