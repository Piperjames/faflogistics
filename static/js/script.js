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
    store = JSON.parse(localStorage["sikafie"])
    if (main){
        if (store[main]){
            sub = store[main]
            return sub[key]
        }
    }
    return store[key]
}

function get_user_details(username, token){
    $.ajax({
        type: "get",
        url: "http://faflogistics.herokuapp.com/user/"+username,
        headers: {"Authorization": "JWT "+token},
        dataType: "json",
        statusCode: {500: function(){login(get_info("username", "user"), get_info("password", "user"))}},
        success: function(data){data["password"] = get_info("password", "user");
                                update_info(data, "user");
                                window.location.href = "home.html"}
    })
}

function get_apparatus(){
    var user_id = get_info("_id", "user")
    var token = get_info("token", "user")

    $.ajax({
        type: "get",
        url: "http://faflogistics.herokuapp.com/apparatus/"+user_id,
        headers: {"Authorization": "JWT "+token},
        dataType: "json",
        statusCode: {500: function(){login(get_info("username", "user"), get_info("password", "user"))}},
        success: function(data){if (data['feedbacks']){update_info(data["feedbacks"], "feedbacks")};
                                if (data['pledges']){update_info(data["pledges"], "pledges")};
                                if (data['payments']){update_info(data["payments"], "payments")};
                                set_user_details();
                                set_pledges();
                                set_payments();
                                set_feeds();}
    })
}

function count_down(date){
    var countDownDate = new Date(date).getTime();
    var x = setInterval(function() {
        var now = new Date().getTime();

        var distance = countDownDate - now;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        $("li.timer").html(days + "d " + hours + "h "+ minutes + "m " + seconds + "s ");

        if (distance < 0) {
            clearInterval(x);
            $("li.timer").html("EXPIRED").css("color", "red");
        }
    }, 1000);
}

function set_pledges(){
    if (get_info("pledges")){
        $("div.pledges").html("");
        pd = get_info("pledges");
        pledges = []
        for (x in pd){pledges.push(pd[x])}
        pledges.reverse();
        if (pledges.length > 10){
            pledges = pledges.slice(0, 10);
        }
        for (i=0; i<=pledges.length-1; i++){
            if (pledges[i]['redeemed']){
                var state = "redeemed"
            }else if (new Date(pledges[i]["date"]) > new Date()){
                var state = "notexpired"
            }else if (new Date(pledges[i]["expired"]) < new Date){
                var state = "expired"
            }
            var line = "<ul class='pledge-list'><li><img src='static/images/";
            line += state+".gif'/></li>";
            line += "<li class='pledge-amount'>&cent;"+pledges[i]["amount"]+"</li>";
            line += "<li class='pledge-date'>"+pledges[i]["date"]+"</li></ul>"
            $(line).appendTo($("div.pledges"));

        }
        var latest = pledges[0]
        $("div.pledge-pending").attr("data-action", latest._id)
        $("li.pend").html("&cent;"+latest.amount);

        count_down(latest.date)
    }else{
        $("<h3>You have no pledges</h3>").appendTo($("div.pledges"));
    }

}

function set_payments(){
    if (get_info("pledges")){
        pd = get_info("pledges")
        tt = []
        for (x in pd){tt.push(pd[x])}
        tt.reverse()
        last = tt[0]
        if (last.redeemed){
            amount = parseInt(last.amount)*2;
            $("span.pend-pay").html("GH&cent;"+amount.toString()+".00");
        }

        if (get_info("payments")){
            pm = get_info("payments")
            pts = []
            for (x in pm){pts.push(pm[x])};
            pts.reverse()
            for (i=0; i<=pts.length-1; i++){
                var line = "<tr><td class='left'>GH&cent;"+pts[i].amount+".00</td>";
                line += "<td>GH&cent;"+(parseInt(pts[i].amount)-15)/2+".00</td>";
                line += "<td class='right'>"+new Date(pts[i].date).toDateString()+"</td></tr>";
                $(line).appendTo($("table.payouts"));
            }
        }
    }

}

function set_feeds(){
    if (get_info("feedbacks")){
        fds = get_info("feedbacks")
        feeds = []
        reps = []

        for (x in fds){feeds.push(fds[x])}
        feeds.reverse();
        last = feeds[0];

        var line = "<ul class='feeds'>";
        line += "<li class='me'>"+last.content+"</li>";
        line += "<li class='ans'>"+last.reply+"</li></ul>"

        $(line).appendTo("article.help")
    }
}

function cal_reward(){
    pledge = $("option:selected").val().split(" ")[1];
    if (!$.isNumeric(pledge)){
        $("div.reward span").html("GH&cent;0.00");
    }else{
        $("div.reward span").html("GH&cent;"+pledge*2+".00");
    }
}

function place_pledge(){
    var amount = $("option:selected").val().split(" ")[1];
    if (!$.isNumeric(Number.parseInt(amount))){
        alert("Select an amount to pledge");
    }else {
        if (get_info($(".pledge-pending").attr('data-action'), "pledges")){
            latest = get_info($(".pledge-pending").attr("data-action"), "pledges")
            if (!latest.redeemed || !latest.expired){
                alert("Please redeem your pending pledge \nbefore you can make a new pledge!!!")
                console.log("Please redeem your pending pledge \nbefore you can make a new pledge!!!")
            }else{
                total = 15.00+(Number.parseInt(amount))
                var conf = "Make a pledge of GHC"+amount+"?\nYou will have to make a ";
                conf += "\npayment of GHC"+total+".00 to \nmtn number 0548045219";
                conf += "\n (C-CLICK VENTURES)";
                confirm(conf);

                $.ajax({
                    type: 'post',
                    url: 'http://faflogistics.herokuapp.com/pledge',
                    headers: {"Authorization": "JWT "+get_info("token", "user")},
                    contentType: "application/json",
                    dataType: "json",
                    processData: false,
                    data: JSON.stringify({"amount": amount, "user_id": get_info("_id", "user")}),
                    success: function(data){update_info(data, "pledges");
                                    window.location.href = "home.html"},
                    error: function(data){console.log(data)}
                })
            }
        }else{
            total = 15.00+(Number.parseInt(amount))
            var conf = "Make a pledge of GHC"+amount+"?\nYou will have to make a ";
            conf += "\npayment of GHC"+total+".00 to \nmtn number 0548045219";
            conf += "\n (C-CLICK VENTURES)";
            confirm(conf);

            $.ajax({
                type: 'post',
                url: 'http://faflogistics.herokuapp.com/pledge',
                headers: {"Authorization": "JWT "+get_info("token", "user")},
                contentType: "application/json",
                dataType: "json",
                processData: false,
                data: JSON.stringify({"amount": amount, "user_id": get_info("_id", "user")}),
                success: function(data){update_info(data, "pledges");
                                    window.location.href = "home.html"},
                error: function(data){console.log(data)}
            })
        }
    }
}

function post_feedback(){
    var content = $("textarea.issue").val();

    if (get_info("feedbacks")){
        fds = get_info("feedbacks");
        feedbacks = []
        for (x in fds){feedbacks.push(fds[x])}
        feedbacks.reverse();
        last = feedbacks[feedbacks.length-1]

        if (last.replied){
            alert("Please be patient. We will get\nto you as soon as possible.")
        }else{
            $.ajax({
                type: 'post',
                url: 'http://faflogistics.herokuapp.com/feedback',
                headers: {"Authorization": "JWT "+get_info("token", "user")},
                contentType: "application/json",
                dataType: "json",
                processData: false,
                data: JSON.stringify({"content": content, "user_id": get_info("_id", "user")}),
                success: function(data){update_info(data, "feedbacks");
                                alert("Thanks for the feedback.\nWe will work on it\nas soon as possible.");
                                $("textarea.issue").val("");
                                console.log("Thanks for the feedback.\nWe will work on it\nas soon as possible.");
                                set_feeds();},
                statusCode: {500: function(){login(get_info("username", "user"), get_info("password", "user")),
                                     post_feedback()}}
            })
        }
    }else{
        $.ajax({
            type: 'post',
            url: 'http://faflogistics.herokuapp.com/feedback',
            headers: {"Authorization": "JWT "+get_info("token", "user")},
            contentType: "application/json",
            dataType: "json",
            processData: false,
            data: JSON.stringify({"content": content, "user_id": get_info("_id", "user")}),
            success: function(data){update_info(data, "feedbacks");
                                alert("Thanks for the feedback.\nWe will work on it\nas soon as possible.");
                                $("textarea.issue").val("");
                                console.log("Thanks for the feedback.\nWe will work on it\nas soon as possible.");
                                set_feeds()},
            statusCode: {500: function(){login(get_info("username", "user"), get_info("password", "user")),
                                     post_feedback()}}
        })
    }
}

function login(username, password){
    var tosend = {username: username, password: password};
    $.ajax({
        type: "post",
        url: "http://faflogistics.herokuapp.com/auth",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(tosend),
        statusCode: {500: function(){$("h4.login").text("User does not exist")},
                     401: function(){$("h4.login").text("Invalid credentials")}},
        success: function(data){update_info({"token": data["access_token"]}, "user");
                                get_user_details(username, data["access_token"]);}
    })
}

function logout(){
    localStorage.removeItem("sikafie");
    window.location.href = "index.html";
}

function set_user_details(){
    $("header h2").html(get_info("fullname", "user"));
}

$(function(){
    $(document).ajaxStart(function(){
        $("div.loader-page").show();
    })
    $(document).ajaxStop(function(){
        $("div.loader-page").hide();
    })
    get_apparatus();


    $("div.tab").on('click', function(){
        $("article").hide();
        $(".tab").removeClass("current_tab");
        $(this).addClass("current_tab");
        var action = $(this).attr("data-action");
        $("article").each(function(){
            if ($(this).hasClass(action)){
                $(this).slideToggle(500);
            }
        })
    })

    $("img.close").on('click', function(){
        $("article").hide();
        $("nav").slideToggle(500);
    })

    $("input.pledge-button").on('click', place_pledge)

    $(".logout-button").on('click', logout);

    $(".complain-button").on('click', post_feedback);
    cal_reward();
})
