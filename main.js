
//Initierar webbplatsen 
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("add-form");

    if (form) {
        addWorkexperience();
    }

    const jobs = document.getElementById("job-posts");

    if (jobs) {
        getWorkexperience();
    }

});

//Funktion som lägger till arbetslivserfarenhet
function addWorkexperience() {


    const form = document.getElementById("add-form"); //Hämtar formuläret

    form.addEventListener("submit", (event) => { //Lyssnar på submit-knappen på formuläret

        event.preventDefault() //Förhindrar formuläret att ladda om sidan 

        const submitBtn = document.getElementById("submit-btn"); //Ändrar submit-knappens utseende
        submitBtn.textContent = "Lägger till..."

        //Tar emot formulärets data
        const companyName = document.getElementById("companyname").value;
        const jobTitle = document.getElementById("jobtitle").value;
        const location = document.getElementById("location").value;
        const startDate = document.getElementById("startdate").value;
        const endDate = document.getElementById("enddate").value;
        const description = document.getElementById("description").value;

        //Samlar och lägger ihop all data 
        const workexperience = {
            companyName,
            jobTitle,
            location,
            startDate,
            endDate,
            description
        }

        //Validerar datan 
        const errors = validateForm(workexperience)

        //Om fel finns så startas en annan funktion men...
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        //... om inga fel finns så går den vidare till att skicka datan till API
        sendWorkexperience(workexperience);

    });
};

function validateForm(workexperience) {

    //En tom variabel att samla felmeddelanden i
    const errors = [];

    //Lägger till felmeddelanden
    if (!workexperience.companyName.trim()) {
        errors.push("Ange arbetsplatsens namn")
    }

    if (!workexperience.jobTitle.trim()) {
        errors.push("Ange din jobbtitel")
    }

    if (!workexperience.startDate) {
        errors.push("Lägg till ett startdatum")
    }

    if (workexperience.endDate && new Date(workexperience.startDate) > new Date(workexperience.endDate)) {
        errors.push("Startdatum kan inte vara efter slutdatum")
    }

    //Returnerar felmeddelanden 
    return errors;

}

//Skickar data till API
async function sendWorkexperience(workexperience) {

    try {

        //Skickar data via fetch
        const response = await fetch("http://localhost:5468/workexperience/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(workexperience)
        });

        let data = await response.json();

        if (!response.ok) { //Vid fel skrivs felmeddelande ut 
            throw new Error(data.message || "Kunde inte lägga till arbetserfarenheten");
        }

        //Vid lyckat resultat så ändras submit-knappen och ger feedback till användaren
        const submitBtn = document.getElementById("submit-btn");
        submitBtn.textContent = "Tillagd!"
        submitBtn.style.backgroundColor = "green";
        submitBtn.style.color = "white";

        document.getElementById("add-form").reset();

        setTimeout(() => { //Ändrar tillbaka submit-knappen till ursprungsläge
            submitBtn.textContent = "Lägg till";
            submitBtn.style.backgroundColor = "";
            submitBtn.style.color = "";
        }, 1500);

    } catch (error) { //Felhantering

        showErrors([error.message]);

    }
};

//Skriver ut felmeddelanden
function showErrors(errors) {

    const errorContainer = document.querySelector(".error-messages"); //Hämtar felmeddelanderutan 

    errorContainer.style.display = "block"; //Ändrar synlighet på elementet 

    errorContainer.innerHTML = errors //Lägger till felmeddelandet i elementet
        .map(error => `<p>${error}</p>`)
        .join("");

    //Ändrar submit-knappen i formuläret för att ge ytterliggare feedback till användaren 
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.textContent = "Något gick fel";
    submitBtn.style.backgroundColor = "#cd5050";
    submitBtn.style.color = "white";

    setTimeout(() => { //Ändrar tillbaka submit-knappen till ursprungsläge
        submitBtn.textContent = "Lägg till";
        submitBtn.style.backgroundColor = "";
        submitBtn.style.color = "";
    }, 2000);


}

//Hämtar data från API 
async function getWorkexperience() {

    //Hämtar data via fetch 
    const response = await fetch("http://localhost:5468/workexperience/", {
        method: "GET"
    });

    let data = await response.json();
    console.log(data);

    const jobContainer = document.querySelector("#job-posts"); //Hämtar jobbrutan 

    jobContainer.innerHTML = ""; //Tömmer listan för att förhindra upprepningar 

    data.forEach((job) => { //Loopar igenom varje jobb
        
        //Ändrar datumformatet
        const startDate = job.startDate.split("T")[0]; 
        const endDate = job.endDate.split("T")[0]; 
        
        //Skriver ut varje enskilt jobb
        jobContainer.innerHTML += `
        <article class="job-post">
            <div>
                <h3>${job.jobTitle}</h3>
                <button id="delete-btn" data-id="${job._id}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
            <div>
                <p class="company">${job.companyName} | <span>${job.location}</span></p>
                <p class="dates">${startDate} - ${endDate}</p>
            </div>
            <p class="description">${job.description}</p>
        </article>`
    })

    const deleteButtons = document.querySelectorAll("#delete-btn"); //Hämtar deleteknappen

    //Skickar med jobb-id till deletefunktionen
    deleteButtons.forEach(button => {
        button.addEventListener("click", () => {

            const id = button.dataset.id;

            deleteWorkexperience(id);

        })
    })

};

//Tar bort data ur databasen 
async function deleteWorkexperience(id) {

    //Tar bort data med fetch
    const response = await fetch(`http://localhost:5468/workexperience/${id}`, {
        method: "DELETE"
    });

    if (response.ok) { //Om allt gick bra - uppdateras listan 
        getWorkexperience();
    }

}