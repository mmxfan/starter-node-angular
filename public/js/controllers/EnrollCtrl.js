angular.module('EnrollCtrl', []).controller('EnrollController', function($scope) {

	$scope.tagline = 'Nothing beats a pocket protector!';
	$scope.recording=false;	//not recording
	$scope.timer1Visible=true;

	$scope.startRecording=function(){
		// recording
		$scope.recording=true;
		//show timer
		$scope.timer1Visible=false;
		//start the timer
		$scope.$broadcast('timer-start');

	};

	$scope.stopRecording=function(){
		// console.log("stop rec.");
		// not recording
		$scope.recording=false;
		//stop the timer
		$scope.$broadcast('timer-stop');
	};

});