//'plus' button functionality
$(".fa-minus").click(function(){
    $("input").fadeToggle(200);
    $("#submit").fadeToggle(200);
    $(this).toggleClass('fa-plus fa-minus');
});

//displaying default date 
$(document).ready( function() {
    var setDate = getDefaultDate();       
    $(".listDate").val(setDate); 
    console.log("today is: " + setDate); 
});

//for pending task-dates dropdown
var ptDay = 1;
for(var i = 0; i < 14; i++){
    $(".ptDisplay").append("<option>" + ptDay + "</option>");
    ptDay++;
}

//for completed task-dates dropdown
var ctDay = 1;
for(var i = 0; i < 30; i++){
    $(".ctDisplay").append("<option>" + ctDay + "</option>");
    ctDay++;
}

//for 'delete' button
$("tbody").on("click", ".delete", function(event){ 
    var ans = prompt("ARE YOU SURE YOU WANT TO DELETE THIS TASK ?");
    if(ans == "yes"||ans == "yeah"){
        //for display screen
        onDelete(event.target);
        event.stopPropagation();            
        
    }
});

//action taken to delete target
function onDelete(target){
    $(target).parent().parent().fadeOut(600, function(){
        $(target).remove(); 
        //for firebase
        var key = target.id;
        console.log(key);
        firebase.database().ref("listItem1").child(key).remove();                            
    });
}

//for 'complete' button
$("tbody").on("click", ".complete", function(event){
    //for display screen
    $(event.target).parent().each(function(){
        var task = $(event.target).parent().parent().find("td:first").text();
        var taskDate = $(event.target).parent().parent().find("td:nth-child(2)").text();
        var completedOnDate = getDefaultDate();
        $(".completedTaskTable").append("<tr> <td>" + task + "</td> <td>" + taskDate + "</td><td style = 'text-align: center'>" + completedOnDate + "</td>");
        $(event.target).parent().parent().fadeOut(600, function(){
            $(event.target).remove(); 
        });
        event.stopPropagation();               
    });     
    //for updating task status    
    var task = $(event.target).parent().parent().find("td:first").text();
    var taskDate = $(event.target).parent().parent().find("td:nth-child(2)").text();
    var completedOnDate = getDefaultDate();
    var key = event.target.id;     
    var refer = firebase.database().ref("listItem1").child(key);
    refer.set({
        Task: task,
        Date: taskDate,
        completed_on: completedOnDate ,
        status: true
    })
    
});


//for toggle
    //completed task table
$(".completed .fa-caret-square-o-up").click(function(){
    $(".completedTaskTable").fadeToggle(200);    
    $(this).toggleClass('fa-caret-square-o-down fa-caret-square-o-up');
});
    //pending task table
$(".pending .fa-caret-square-o-up").click(function(){
    $(".pendingTaskTable").fadeToggle(200);
    $(this).toggleClass('fa-caret-square-o-down fa-caret-square-o-up');
});


//for adding in database and displaying on screen
//event listener
$(".submitClick").click(function(){  
    var newTask = $("input[type = 'text']").val();
    var newTaskDate = $("input[type = 'date']").val();  
    //for displaying on screen
     $("input[type = 'text']").val("");  
        var setDate = getDefaultDate();       
    $("input[type = 'date']").val(setDate);  
    if (newTask && newTaskDate){
        //function-call for adding in DB
        addItem(newTask,newTaskDate); 
        alert("task ADDED in DATABASE");
    } else{
        alert("Add a task first!");
    } 
});

//function description for adding in DB
var rootRef = firebase.database().ref().child("listItem1"); 
function addItem(listTask, listDate, status){
    newRootRef = rootRef.push();
    newRootRef.set({
        Task : listTask ,
        Date : listDate ,
        status: false
    }) 
}

//for retrieving pending tasks 
$(".ptDisplay").change(function(){
    $('.new_row1').remove();
    //firebase connection
    var a = firebase.database().ref().child("listItem1");
    a.on("child_added", snap => {
        var task = snap.child("Task").val();
        var dueDate = snap.child("Date").val();
        var status = snap.child("status").val();
        var key = snap.key;        

        // Days you want to subtract 
        var days = $(".ptDisplay").val(); 
        var getMaxDate = getPendingTaskDate(days); //user-triggered --> max comparison value
        //converting backend date
        var date = new Date(dueDate);
        //min value --> default date --> new Date()
        if(status == false && new Date(date)<= new Date(getMaxDate) && (new Date(date)>=new Date() || new Date(date).getDate() == new Date().getDate())){
            $(".pendingTaskTable").append("<tr class ='new_row1'> <td>" + task + "</td> <td style = 'text-align: center'>" + dueDate + "</td> <td style = 'text-align: center'> <button class = 'btn btn-success complete' type = 'button' id='"+key+"'>COMPLETE</button> <button class = 'btn btn-danger delete' type = 'button' id='"+key+"'>DELETE</button> </td></tr>" );                
        } 
    });
});

//for retrieving completed tasks
$(".ctDisplay").change(function(){    
    $('.new_row2').remove();
     //firebase connection
     var a = firebase.database().ref().child("listItem1");
     a.on("child_added", snap => {
         var task = snap.child("Task").val();
         var dueDate = snap.child("Date").val();
         var status = snap.child("status").val();
         var completedOnDate = snap.child("completed_on").val();
         // Days you want to subtract 
         var days = $(".ctDisplay").val(); 
         var getMinDate = getCompletedTaskDate(days);//user-triggered --> min comparison value
        //converting backend date
        var date = new Date(completedOnDate);        
        //max value --> default date --> new Date()

         //condition
        if(status == true && (new Date(date)<= new Date()|| new Date(date).getDate() == new Date().getDate()) && new Date(date)>=new Date(getMinDate)){
            $(".completedTaskTable").append("<tr class = 'new_row2'> <td>" + task + "</td> <td>" + dueDate + "</td><td style = 'text-align: center'>" + completedOnDate + "</td>");
        } 
    });
});

//function to dedcue the user-triggered date for pending tasks
function getPendingTaskDate(days){
    var date = new Date(); 
    var last = new Date(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var day =last.getDate();
    var month = last.getMonth() < 10 ? '0' + (last.getMonth() + 1) : (last.getMonth() + 1); 
    var year=last.getFullYear();
    let selectedDate = (year)+"-"+(month)+"-"+(day);      
    return(selectedDate);
}

//function description to set default date
function getDefaultDate(){
    let now = new Date(); 
    let day = ("0" + now.getDate()).slice(-2);  
    let month = ("0" + (now.getMonth() + 1)).slice(-2);
    //for displaying
    let today = now.getFullYear()+"-"+(month)+"-"+(day);
    return(today);
}

//function to dedcue the user-triggered date for completed tasks
function getCompletedTaskDate(days){
    var date = new Date(); 
    var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
    var day =last.getDate();
    var month=last.getMonth()+1; 
    var year=last.getFullYear();
    let selectedCompDate = (year)+"-0"+(month)+"-"+(day);      
    return(selectedCompDate);
}



