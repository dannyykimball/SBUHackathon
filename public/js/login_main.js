function startUp()
{
    var create_Company_Page = document.getElementsByClassName("create_Company_Page");
    var create_Account_Page = document.getElementsByClassName("create_Account_Page");
    $(create_Company_Page).toggle();
    $(create_Company_Page).fadeOut();
    $(create_Account_Page).toggle();
  $(create_Account_Page).fadeOut();
    
}

/*
    function to set visability of elements
    Call it like this:
    $("#someElem").invisible();
    $("#someOther").visible();
*/
(function($) {
$.fn.invisible = function() {
    return this.each(function() {
        $(this).css("visibility", "hidden");
    });
};
$.fn.visible = function() {
    return this.each(function() {
        $(this).css("visibility", "visible");
    });
};
}(jQuery));


async function login()
	{		
		var compName = document.getElementById("companyName").value;
		var userName = document.getElementById("user").value;
		var password = document.getElementById("pass").value;

		localStorage.setItem('userName', userName)
		window.location.href = "canvas-designer.html";
		/*
		if(compName.length == 0)
		{
			alert("Enter a company name");
		}
		else if(user.length == 0)
		{
			alert("Enter an email");
		}
		else if(pass.length == 0)
		{
			alert("Enter a Password");
		}
		else //logging in 
		{
			var success = true;
			await firebase.auth().signInWithEmailAndPassword(userName, password).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				success = false;
				alert(errorMessage);
			});

			if(success)
			{
				console.log("Logged in!");
				localStorage.setItem('companyName', compName);
				localStorage.setItem('userName', userName)
				window.location.href = "video.html";
			}
		}
		*/
	}

	/*
		Verifys if an account exists
		Returns True if the account exists
		Returns False if the account does not exist
	*/
	function add_Company_to_Database(name)
	{
		const dbRefObject = firebase.database().ref().child('object');

		dbRefObject.on('value')

	}

	function create_new_Company()
	{
		console.log("Creating new Database");
		var name = document.getElementById("create_company_Name").value;

		if(name.length > 0) //user has entered a company name
		{
			console.log("adding to list");
			add_Company_to_Database(name);
		}
		else
			alert("Please enter a company name");
	}



	async function create_new_Account()
	{
		var user = document.getElementById("create_new_User").value;
		var pass1 = document.getElementById("create_new_Pass").value;
		var pass2 = document.getElementById("create_new_Pass_2").value;

		if(user.length == 0)
		{
			alert("Enter a Username");
		}
		else if(pass1.length == 0)
		{
			alert("Enter a Password");
		}
		else if(pass2.length == 0)
		{
			alert("Re-enter the password");
		}
		else if(pass1 != pass2)
		{
			alert("Passwords do not match");
		}
		else //create account
		{
			var success = true;
			await firebase.auth().createUserWithEmailAndPassword(user, pass1).catch(
				function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				alert(errorMessage);
				success = false;
			});

			if(success)
			{
				console.log("Created account");
				login_screen_create_Account_back();
			}
		}
	}