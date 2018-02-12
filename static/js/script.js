function cal_reward(){
    pledge = $("option:selected").val().split(" ")[1];
    $("span#reward").text("GHC"+pledge*2+".00");
}

$(function(){
    $("li.tab").on('click', function(){
        $("li.tab").removeClass("current_tab");
        $(this).addClass("current_tab");
        $("article").hide();
        var action = $(this).attr("data-action");
        $("article").each(function(){
            if ($(this).hasClass(action)){
                $(this).show();
            }
        })
    })
    cal_reward();
})