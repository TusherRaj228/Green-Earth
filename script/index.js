const loadLessons=()=>{
    fetch("https://openapi.programming-hero.com/api/categories")
    .then((res)=>res.json())
    .then((json)=>displayLesson(json.categories));
};

const loadPlants = () => {
    fetch("https://openapi.programming-hero.com/api/plants")
    .then(res => res.json())
    .then(data => displayPlants(data.plants))
    .catch(err => console.error("Error loading plants:", err));
};

const displayPlants = (plants) => {
    const plantContainer = document.getElementById("plants-container");
    plantContainer.innerHTML = "";

    plants.forEach(plant => {
        const plantCard = document.createElement("div");
        plantCard.classList.add("bg-white", "rounded-lg", "shadow-md", "p-4");

        plantCard.innerHTML = `
            <img src="${plant.image}" alt="${plant.plant_name}" class="w-full aspect-4/3 object-cover rounded-lg mb-3">
            <h3 class="font-bold text-lg">${plant.name}</h3>
            <p class="text-gray-600">${plant.description}</p>
            <div class="flex justify-between">
            <p class="bg-green-200 text-green-400 rounded-lg"> ${plant.category}</p>
           <p class="">
               <i class="fa-solid fa-bangladeshi-taka-sign"></i> ${plant.price}
           </p>


            </div>
            <button class=" w-full mt-3 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-700">
                Add to Cart
            </button>
        `;
        plantContainer.appendChild(plantCard);
    });
};

// Page load হলে data আনবে
loadPlants();



const displayLesson=(lessons)=>{
   const categoriesList = document.getElementById("Categories-list");
   categoriesList.innerHTML="";
   
   for(let lesson of lessons){
     const categoriesDiv = document.createElement("div");
     categoriesDiv.innerHTML=`
     <button onclick="loadCard( '${lesson.category_name}')" class=" text-left px-4 py-2  rounded-md 
                      hover:text-white hover:bg-green-300
                     transition duration-300 ease-in-out">
        ${lesson.category_name}
        </button>
     
     `;
     categoriesList.append(categoriesDiv);
   }
}
loadLessons();
