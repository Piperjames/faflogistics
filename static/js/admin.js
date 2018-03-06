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
                                if (data["role"] == "user"){
                                    window.location.href = "home.html";
                                }else {
                                    window.location.href = "admin.html";
                                }}

    })
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

function get_details(){
    var username = get_info("username", "user");
    var token = get_info("token", "user");

    $.ajax({
        type: 'get',
        url: 'http://faflogistics.herokuapp.com/admin/details',
        headers: {"Authorization": "JWT "+token},
        statusCode: {500: function(){login(get_info("username", "user"), get_info("password", "user"));
                                     get_details;}},
        success: function(data){update_info(data, "details");set_details();}
    })
}

function set_details(){
    if (get_info("users", "details")){
        var users = get_info("users", "details")
        var num = []
        for (user in users){
            num.push(user)
        }
        $("tr.users td.num").html(num.length)
    }

    if (get_info("pledges", "details")){
        $("table.pledges").html("");
        var pledges = get_info("pledges", "details")
        var num = []
        var amount = 0
        for (pledge in pledges){
            pb = pledges[pledge]
            if (!pb.redeemed || new Date(pb.date) < new Date()){
                num.push(pledges[pledge])
                amount += parseInt(pledges[pledge].amount)
            }
        }
        num.reverse()
        for (i=0; i<=num.length-1; i++){
            var date = new Date(num[i].date).toDateString()
            var amt = num[i].amount
            var user_id = num[i].user_id


            var users = get_info("users", "details")
            for (user in users){
                if (users[user]._id == user_id){
                   var username = users[user].username
                   var fullname = users[user].fullname
                }
            }

            var line = "<tr class='pledge' data-action='"+num[i]._id+"'>"
            line += "<td class='user'><h3>"+fullname+"</h3>"
            line += "<h3 class='uname'>["+username+"]</h3></td>"
            line += "<td class='date'>"+date+"</td>"
            line += "<td class='amount'>GH&cent;"+amt+"</td></tr>"

            $("table.pledges").append($(line))
        }
        $("tr.pledges td.num").html(num.length)
        $("tr.pledges td.amount").html("GH&cent;"+amount.toString()+".00")

    }

    if (get_info("pledges", "details")){
        $("table.payouts").html("");
        var db = get_info("details")
        payments = []
        payments.reverse()
        for (pledge in db.pledges){
            if (db.pledges[pledge].redeemed){
                payments.push(db.pledges[pledge])
            }
        }
        var amount = 0;
        for (i=0; i<=payments.length-1; i++){
            amount += parseInt(payments[i].amount)

            var date = new Date(payments[i].date).toDateString()
            var amt = payments[i].amount
            var user_id = payments[i].user_id


            var users = get_info("users", "details")
            for (user in users){
                if (users[user]._id == user_id){
                   var username = users[user].username
                   var fullname = users[user].fullname
                }
            }

            var line = "<tr class='pay' data-action='"+payments[i]._id+"'>"
            line += "<td class='user'><h3>"+fullname+"</h3>"
            line += "<h3 class='uname'>["+username+"]</h3></td>"
            line += "<td class='date'>"+date+"</td>"
            line += "<td class='amount'>GH&cent;"+amt+"</td></tr>"

            $("table.payouts").append($(line))
        }
        $("tr.payments td.num").html(payments.length)
        $("tr.payments td.amount").html("GH&cent;"+amount.toString()+".00")
    }

    if (get_info("feedbacks", "details")){
        var feedbacks = get_info("feedbacks", "details")
        var num = []
        for (fd in feedbacks){
            num.push(fd)
        }
        $("tr.feedbacks td.num").html(num.length)
    }
}

function redeem_pledge(pledge_id, user_id){
    $.ajax({
        type: 'post',
        url: 'http://faflogistics.herokuapp.com/pledge/'+pledge_id,
        headers: {"Authorization": "JWT "+get_info("token", "user")},
        contentType: "application/json",
        dataType: "json",
        processData: false,
        data: JSON.stringify({"user_id": user_id}),
        success: function(data){$("div.pledge-details").remove();get_details();},
        error: {500: function(){login(get_info("username", "user"), get_info("password", "user"))
                                redeem_pledge(pledge_id, user_id)}}

    })
}

function make_payment(amount, user_id, pledge_id){
    $.ajax({
        type: 'post',
        url: 'http://faflogistics.herokuapp.com/pay/'+pledge_id,
        headers: {"Authorization": "JWT "+get_info("token", "user")},
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"amount": amount, "user_id": user_id}),
        success: function(data){$("div.pledge-details").remove();get_details();},
        error: {500: function(){login(get_info("username",'user'), get_info("password", "user"))}}
    })
}

function logout(){
    localStorage.removeItem("sikafie");
    window.location.href = "index.html";
}

function set_user_details(){
    $("header h2").html(get_info("fullname", "user")+" [ADMIN]");
}

$(function(){
    $(document).ajaxStart(function(){
        $("div.loader-page").show();
    })
    $(document).ajaxStop(function(){
        $("div.loader-page").hide();
    })

    set_user_details();
    get_details();
    //set_pledges();

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

    $(".logout-button").on('click', logout);

    $('img.refresh').on('click', function(){
            get_details();
    })

    $("table.pledges").on('click','tr', function(){
        id = $(this).attr('data-action')
        pledges = get_info("pledges", "details")
        for (pledge in pledges){
            if (pledge == id){
                pd = pledges[pledge]
            }
        }
        users = get_info("users", "details")
        user = users[pd.user_id]

        var platform = "<div class='pledge-details'>";
        platform += "<img class='close' src='static/images/close.png'/>"
        platform += "<table class='pd-details'><tr>"
        platform += "<th>ID</th><td>"+pd._id+"</td></tr>"
        platform += "<tr><th>Name</th><td>"+user.fullname+"</td></tr>"
        platform += "<tr><th>User</th><td>"+user.username+"</td></tr>"
        platform += "<tr><th>Amount</th><td>GH&cent;"+pd.amount+"</td><td></tr>"
        platform += "<tr><th>Date</th><td>"+pd.date+"</td>"
        platform += "<tr><th>Expired</th><td>"+pd.expired+"</td>"
        platform += "<tr><th>Redeemed</th><td>"+pd.redeemed+"</td>"
        platform += "</tr></table>"
        platform += "<input type='button' class='delete' value='Delete'/>"
        platform += "<input type='button' class='redeem' value='Redeem'/>"
        platform += "<input type='button' class='payout' value='Payout'/></div>"

        $('body').append($(platform));
        $(platform).show();

        $('img.close').on('click',function(){
            $("div.pledge-details").remove()
        })

        $("input.redeem").on('click', function(){
            redeem_pledge(pd._id, user._id)
        })

        $("input.payout").on('click', function(){
            amt = parseInt(pd.amount)*2
            make_payment(amt, user._id, pd._id)
        })

    })

    //cal_reward();
})
