const loadLessons=()=>{
    fetch("https://openapi.programming-hero.com/api/categories")
    .then((res)=>res.json())
    .then((json)=>displayLesson(json.categories));
};

const displayLesson=(lessons)=>{
   const categoriesList = document.getElementById("Categories-list");
   categoriesList.innerHTML="";
   
   for(let lesson of lessons){
     const categoriesDiv = document.createElement("div");
     categoriesDiv.innerHTML=`
     <button class=" text-left px-4 py-2  rounded-md 
                      hover:text-white hover:bg-green-300
                     transition duration-300 ease-in-out">
        ${lesson.category_name}
        </button>
     
     `;
     categoriesList.append(categoriesDiv);
   }
}
loadLessons();
