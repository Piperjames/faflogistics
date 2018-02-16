function login(){
    var username = $("input.log-phonenumber").val();
    var password = sha512($("input.login-password").val());
    var tosend = {username: username,
                  password: password};
    $.ajax({
        type: "post",
        url: "/auth",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(tosend),
        statusCode: {500: function(){$("h4.login").text("User does not exist")},
                     401: function(){$("h4.login").text("Invalid credentials")}},
        success: function(data){window.location.href = '/home'},
    })
}

function register(){
    var fullname = $("input.fullname").val();
    var username = $("input.reg-phonenumber").val();
    var password = $("input.register-password").val();
    var confirm = $("input.confirm-password").val();
    if (confirm != password) {
        $("h4.register").text("passwords do not match");
    }else{
        var hashed = sha512(password);
        var content = {fullname: fullname, username: username,
                       password: hashed}

        $.ajax({
            type: "post",
            url: "/user",
            dataType: "json",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(content),
            success: function(data){window.location.href = '/home'},
            error: function(data){console.log(data)}
        })
    }
}

$(function(){
    $("a").on('click', function(e){
        e.preventDefault()
        $("article").hide();
        var curpage = $(this).attr('href')
        $("article").each(function(){
            if ($(this).hasClass(curpage)){
                $(this).show();
            }
        })
    })

    $(".login-button").on('click', login);
    $(".register-button").on('click', register);
})