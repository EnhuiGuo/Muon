muonApp.controller('BoardCtrl', function ($scope, $stateParams, $state) {

	$scope.isNetworkGame = ($stateParams.roomid != '');

	var gametimer = setInterval(function(){

		BoardGUI.timer.seconds++;
	    if (BoardGUI.timer.seconds >= 60) {
	        BoardGUI.timer.seconds = 0;
	        BoardGUI.timer.minutes++;
	        if (BoardGUI.timer.minutes >= 60) {
	            BoardGUI.timer.minutes = 0;
	            BoardGUI.timer.hours++;
	        }
	    }

		document.getElementById("timer").textContent = (BoardGUI.timer.minutes > 0) ? BoardGUI.timer.minutes + ":" + BoardGUI.timer.seconds : BoardGUI.timer.seconds;
	}, 1000);

	$scope.startNewGame = function(){
		BoardGUI.hideAllModals();
		document.getElementById("flagB").classList.remove("fade-out");
		document.getElementById("flagG").classList.remove("fade-out");
		if($scope.isNetworkGame){
			gameCore.RestartGame(true);
		}
		else
			gameCore.RestartGame(false); 	
	}	     

	$scope.proposeRematch = function(){
		$scope.startNewGame();
		cloak.message('proposeRematch');
	}     

	$scope.proposeDraw = function(){
		if($stateParams.roomid != ''){
			//propose draw over the network
			cloak.message('proposeDraw');
		} else {
			if(gameCore.ProposeDrawToAI()){
				gameCore.EndGame();
			} else {
				console.log('Proposal was denied');
			}
		}
	}

	$scope.respondToDraw = function(accept){
		cloak.message('respondToDraw',accept);
		BoardGUI.hideAllModals();
	}

	$scope.respondToRematch = function(accept){
		if(accept)
			$scope.startNewGame(); 

		cloak.message('respondToRematch',accept);
		BoardGUI.hideAllModals();
	}      
	
	$scope.quitToMenu = function(){
		$state.go('menu', {});
		console.log('leaving room');
		if (Network.isConnected){
			cloak.message('leaveRoom'); 
		}

		clearInterval(gametimer);
	}
	
	$scope.sendChat = function(){
		if($scope.chatText != ''){
			if($stateParams.roomid != ''){
				if((new RegExp('<script>')).test($scope.chatText)){
					if(HACKER_MODE_ENABLED){
						cloak.message('chat', $scope.chatText);
					} else {
						cloak.message('chat', (new RegExp (/<script>(.*?)<\/script>/g).exec($scope.chatText)[1]));
					}
				} else {
					cloak.message('chat', $scope.chatText);
				}
				$scope.chatText = '';
			}
			else {
				//chat against the AI
				BoardGUI.appendChatMessage($scope.chatText, true);
				$scope.chatText = '';
				var category = aichat[_.shuffle(_.keys(aichat))[0]];
				var randex = Math.floor(Math.random() * category.length) + 0;
				BoardGUI.appendChatMessage(category[randex], false);
			}
		}
	}

	$scope.gameboardLoaded = function(e){
		if($stateParams.roomid == ''){
			//local game against AI
			gameCore.RestartGame(false);
		} else {
			if($stateParams.waiting == '1'){
			//angular.element(boardHeaderText)[0].innerHTML = "Waiting for opponent";
			BoardGUI.appendSystemMessage("Waiting for opponent");
			BoardGUI.showWaitingModal();
			gameCore.network.role = 'host';
			gameCore.RestartGame(true);

			} else {
				console.log("attempting to join room");
				cloak.message('joinRoom', $stateParams.roomid);
				BoardGUI.appendSystemMessage("Their turn");
				gameCore.network.role = 'client';
				gameCore.RestartGame(true);
				//client is here
				//start game
			}
		}
	}
	
});