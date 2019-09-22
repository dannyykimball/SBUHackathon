//----------------------------------------------------------------------------------------------------------------------------------
function fade_Login() 
{
    var loginElements = document.getElementsByClassName("login");
    $(loginElements).fadeOut();
}
function unfade_Login() 
{
    var loginElements = document.getElementsByClassName("login");
    $(loginElements).fadeIn();
}
function fade_CreateCompany()
{
    var loginElements = document.getElementsByClassName("create_Company_Page");
    $(loginElements).fadeOut();
}
function unfade_CreateCompany()
{
    var loginElements = document.getElementsByClassName("create_Company_Page");
    $(loginElements).fadeIn();
}
function fade_CreateAccount()
{
    var loginElements = document.getElementsByClassName("create_Account_Page");
    $(loginElements).fadeOut();
}
function unfade_CreateAccount()
{
    var loginElements = document.getElementsByClassName("create_Account_Page");
    $(loginElements).fadeIn();
}
//------------------------------------------
//Transversing buttons
function login_screen_create_Company_back()
{
    fade_CreateCompany();
    unfade_Login();
}
function login_screen_create_Account_back()
{
    fade_CreateAccount();
    unfade_Login();
}
function login_screen_create_Company()
{
    fade_Login();
    unfade_CreateCompany();
}

function login_screen_create_Account()
{
    fade_Login();
    unfade_CreateAccount();
}