$(".brighten").click(function() {
  window.location = $(this).find("a").attr("href");
  return false;
});

$(".demo-card-wide").hover(
    function() {
        $(this).toggleClass('mdl-shadow--3dp').toggleClass('mdl-shadow--2dp');

    }
);
var hide = {
    loginbutton: function(){
      $('.signInButtonTitle').hide();
      $('.signOutButtonTitle').show();
      $('.signInButton').hide();
      $('#user_info').show();
      $('#logout_button1').show();
    },
    userinfo: function(){
      $('#user_info').hide();
      $('.signInButtonTitle').show();
      $('.signOutButtonTitle').hide();
      $('.signInButton').show();
      $('#logout_button1').hide();
    }
}

if((logged == 'null')||(logged=='')){
  hide.userinfo();
}
else{
  hide.loginbutton();
}

var notification = document.querySelector('.mdl-js-snackbar');

var validateDetails = function() {
  var name = $('#name');
  var manufacturer = $('#manufacturer');
  var unit = $('#unit');
  var description = $('#description');
  var category = $('#category');

  if (name.val() == "") {
    notification.MaterialSnackbar.showSnackbar(
      {
        message: "Spare Parts Can't  Empty!"
      }
    );
    name.focus();
    return false;
  }
  else if (manufacturer.val() == "") {
    notification.MaterialSnackbar.showSnackbar(
      {
        message: "Manufacturer also required!"
      }
    );
    manufacturer.focus();
    return false;
  }
  else if (unit.val() == "") {
    notification.MaterialSnackbar.showSnackbar(
      {
        message: "Unit also Required!"
      }
    );
    unit.focus();
    return false;
  }
  else if (description.val() == "") {
    notification.MaterialSnackbar.showSnackbar(
      {
        message: "Please provide some description!"
      }
    );
    description.focus();
    return false;
  }
  else if (category.val() == "") {
    notification.MaterialSnackbar.showSnackbar(
      {
        message: "Select a category part!"
      }
    );
    return false;
  }

  $('#spareForm').submit();

};

var googleSignInCallback = function(authResult){
    if (authResult['code']){
        $.ajax({
            type: 'POST',
            url: '/gconnect?state=' + state,
            processData: false,
            contentType: 'application/json',
            data: authResult['code'],
            success: function(result){
                if(result){
                    location.reload(true);
                    var img = result['img'].replace('https','http');
                    hide.loginbutton();
                    $('#userImg').attr('src',img);
                    $('#userName').html(result['name']);
                    $('#userEmail').html(result['email']);
                    logged = 'google';
                }
                else if (authResult['error']){
                    console.log("Following Error Occured:" + authResult['error']);
                }
                else{
                    console.log('Failed to make connection with server, Please check your internet connection.');
                }
            }
        });
    }
};


var logout = function(){

   if(logged=='google'){

    $.ajax({

      type: 'POST',
      url: '/logout',
      processData: false,
      contentType: 'application/json',
      success: function(result){
        console.log(result)
        if(result['state'] == 'loggedOut'){
          notification.MaterialSnackbar.showSnackbar(
            {
              message: "You have been Successfully Logged out!"
            }
          );
          hide.userinfo();

        }
        else if (result['state'] == 'notConnected'){
          notification.MaterialSnackbar.showSnackbar(
            {
              message: "User not Logged in!"
            }
          );
        }
        else if (result['state'] == 'errorRevoke'){
          notification.MaterialSnackbar.showSnackbar(
            {
              message: "Error Revoking User Token!"
            }
          );
        }

      }

    });

   }
   else{

     notification.MaterialSnackbar.showSnackbar(
       {
         message: "User not Logged in!"
       }
     );
   }

}

gapi.signin.render("googleSignIn", {
              'clientid': "1087987737407-rui5lovj3j2q891lniho5qkg4n0b46fj.apps.googleusercontent.com",
              'callback': googleSignInCallback,
              'cookiepolicy': 'single_host_origin',
              'requestvisibleactions': 'http://schemas.google.com/AddActivity',
              'scope': 'openid email',
              'redirecturi': 'postmessage',
              'accesstype': 'offline',
              'approvalprompt': 'force'
});

gapi.signin.render("googleSignInCustom", {
              'clientid': "1087987737407-rui5lovj3j2q891lniho5qkg4n0b46fj.apps.googleusercontent.com",
              'callback': googleSignInCallback,
              'cookiepolicy': 'single_host_origin',
              'requestvisibleactions': 'http://schemas.google.com/AddActivity',
              'scope': 'openid email',
              'redirecturi': 'postmessage',
              'accesstype': 'offline',
              'approvalprompt': 'force'
});

$('#logout_button').click(function(){
    logout();
});

$('#logout_button1').click(function() {
  logout();
});
