function cal_reward(){
    pledge = $("option:selected").val().split(" ")[1];
    $("div.reward span").text("GHC"+pledge*2+".00");
}

$(function(){
    $("div.tab").on('click', function(){
        $("nav").hide();
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

    $("input.pledge-button").on('click', function(){
        $.get('http://faflogistics.herokuapp.com/pledge',function(data){
            console.log(data);
        })
    })
    cal_reward();
})