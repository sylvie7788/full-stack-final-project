
function handleResponse(xhr){
    if(xhr.status>=200 && xhr.status<=400){
        
        const img1 =document.getElementById("img1");
        const img2 =document.getElementById("img2");
        const img3 =document.getElementById("img3");

        const response = JSON.parse(xhr.responseText);
        
      
        

    }else{
        console.log("handleResponse err!", xhr.status);
    }
}


function handleCreateClick(evt){
    evt.preventDefault();
    console.log("create btn clicked");
    
    const url = "/create";
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-Type',"application/x-www-form-urlencoded; charset=UTF-8");//content type
    
    const name = document.getElementById("name").value;//get value from form to save to db
    const year = document.getElementById("year").value;
    const semester = document.getElementById("semester").value;
    const review = document.getElementById("review").value;
    
    xhr.send();

    
}

//handle register 
function main() {


    const create_btn = document.getElementById("create_btn");
    create_btn.addEventListener("click", handleCreateClick);
    
}


document.addEventListener("DOMContentLoaded", main);


