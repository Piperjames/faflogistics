function update_info(info={}, main=""){
    store = JSON.parse(localStorage["sikafie"])
    if (main){
        if (!store[main]){
            store[main] = {}
        }
        sub = store[main]
        for (key in info){
            sub[key] = info[key]
        }
        store[sub] = sub
        localStorage['sikafie'] = JSON.stringify(store)
    }else{
        for (key in info){
            store[key] = info[key]
        }
        localStorage['sikafie'] = JSON.stringify(store)
    }
}
function get_info(key, main=""){
    if (!localStorage["sikafie"]){
        localStorage["sikafie"] = ''
    }
    if ((localStorage["sikafie"]).length == 0){
        return false
    }
    store = JSON.parse(localStorage["sikafie"])
    if (main){
        if (store[main]){
            sub = store[main]
            return sub[key]
        }
    }
    return store[key]
}

function login(username, password){
    if (username.length == 0){
        $("h4.login").text("Please enter username");
    }else if (password.length == 0){
        $("h4.login").text("Please enter password");
    }else{
        var tosend = {username: username, password: password};
        $.ajax({
            type: "post",
            url: "http://faflogistics.herokuapp.com/auth",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(tosend),
            statusCode: {500: function(){$("h4.login").text("User does not exist")},
                         401: function(){$("h4.login").text("Invalid credentials")}},
            success: function(data){update_info({"token": data["access_token"], "password": password,
                                                 "username": username}, "user");
                                                  get_user_details(username, get_info("token", "user"));}
        })
    }
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
            url: "http://faflogistics.herokuapp.com/register",
            dataType: "json",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(content),
            statusCode: {401: function(){$("h4.register").text("User already exists");}},
            success: function(data){login(username, hashed)}
        })
    }
}

function get_user_details(username, token){
    $.ajax({
        type: "get",
        url: "http://faflogistics.herokuapp.com/user/"+username,
        headers: {"Authorization": "JWT "+token},
        dataType: "json",
        statusCode: {500: function(){login(get_info("username", "user"), get_info("password", "user"));
                                     get_user_details(username, get_info("token", "user"))}},
        success: function(data){data["password"] = get_info("password", "user");
                                update_info(data, "user");
                                if (data["role"] == "user"){
                                    window.location.href = "home.html";
                                }else {
                                    window.location.href = "admin.html";
                                }}
    })
}

function get_pledges(user_id, token){
    $.ajax({
        type: "get",
        url: "http://faflogistics.herokuapp.com/pledges/"+user_id,
        headers: {"Authorization": "JWT "+token},
        dataType: "json",
        statusCode: {500: function(){login(get_info("username", "user"), get_info("password", "user"));
                                     get_pledges(get_info("username", "user"), get_info("token", "user"));}},
        success: function(data){update_info(data, "pledges")}
    })
}

$(function(){
    $(document).ajaxStart(function(){
        $("div.loader-page").show();
    })
    $(document).ajaxStop(function(){
        $("div.loader-page").hide();
    })

    if (navigator.onLine){
        if (get_info("token", "user")){
            login(get_info("username", "user"), get_info("password", "user"));
        }else {
            localStorage["sikafie"] = JSON.stringify({});
            $("article").hide();
            $("article.login-page").show();
        }
    }else {
        if (get_info("token", "user")){
            window.location.href = "home.html"
        }else {
            localStorage["sikafie"] = JSON.stringify({});
            alert("You have no internet connection!!");
            $("article").hide();
            $("article.login-page").show();
        }
    }

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

    $(".login-button").on('click', function(){
        var username = $("input.log-phonenumber").val();
        var password = sha512($("input.login-password").val());
        login(username, password);
    });
    $(".register-button").on('click', register);
})
