const url = await GetUrl(); // Récupération url serveur

async function GetCategory () // Récuperation des catégories sur le serveur
{
    const data = await fetch(`${url}categories`);
    const works = await data.json();

    return (works);
}

/* Affichage des boutons */

function CreateCategoryHTML(name, id, content, filterID) // Création du html pour chaque element filtre, et intégration dans le DOM
{
    let button = document.createElement("button")

    button.classList.add(`${name}`);
    button.id = `${id}`;
    button.innerHTML = content;
    document.querySelector("#filters").append(button);
    button.addEventListener("click", (e) => {
        DisplayFilter(filterID);
        DisplayWorks(filterID);
    });
}

async function DisplayCategory () // Conditions initiale pour l'affichage des catégories
{
    const works = await GetCategory();

    CreateCategoryHTML("filter", "all", "Tous", 0);

    for (let id of works)
    {
        CreateCategoryHTML("filter",id.name,id.name,id.id);
    }

}

/* Initialisation et alternance des filtres */

function InitiateFilter() // Etat initial des filtres et images
{
    DisplayFilter(0)
    DisplayWorks(0);
}

function DisplayFilter (filterID) // Affichage du css des filtres si cliqué
{
    const buttons = document.getElementById("filters").childNodes;

    for (let filter = 0; filter<buttons.length; filter++)
    {
        buttons[filter].classList.remove('activated');
    }
    buttons[filterID].classList.add('activated');
}

/* Affichage des images */

function CreateImageHTML (works) // Création du html pour chaque element image et intégration dans le DOM
{
    gallery = document.querySelector('#gallery');

    while(gallery.hasChildNodes())
    {
        gallery.removeChild(gallery.firstChild);
    }

    for (let id of works)
    {
        let img = document.createElement("img");
        let caption = document.createElement("figcaption");
        let figure = document.createElement("figure");

        img.setAttribute('src',`${id.imageUrl}`);
        img.setAttribute('alt',`${id.title}`);
        caption.innerText = `${id.title}`;
        figure.append(img, caption);

        gallery.append(figure);
    }
}

async function DisplayWorks (filterID) // Récupération des travaux sur le serveur
{
    const data = await fetch(`${url}works`);
    const works = await data.json();

    if(filterID !=0)
    {
        let filtered_works = works.filter((works) => works.categoryId==filterID)

        CreateImageHTML (filtered_works);
    }
    else
    {
        CreateImageHTML (works);
    }
}

/* Vérification Login */

function CheckLogin() // Vérification de la presence du token utilisateur
{
    const login = sessionStorage.getItem("token");

    if(login!=null)
    {
        document.getElementById('edition').classList.remove('hidden');
        document.getElementById('logout').classList.remove('hidden');
        document.getElementById('login').classList.add('hidden');
    }
    document.getElementById('logout').addEventListener("click", (e) => {
        sessionStorage.removeItem("token");
        location.reload();
    })
}

/* Fonctions de la fenetre modale */

async function DeleteWork(id) // Suppression travaux
{
    const token = sessionStorage.getItem("token");
    const data = await fetch(`${url}works/${id}`, {
        method: 'DELETE',
        headers: {"Authorization": `Bearer ${token}`}});

    let answer = await data.json();
}

async function AddWork (formData) // Ajout travaux
{
    const token = sessionStorage.getItem("token");
    const data = await fetch(`${url}works`, {
        method: 'POST',
        headers: {'Authorization': `Bearer ${token}`},
        body: formData});

    let answer = await data.json();
}

function OpenModal (modal, event) // Ouvrir la fenetre modale
{
    event.preventDefault()
    event.stopPropagation();
    modal.showModal();
}

function CloseModal (modal, event) // Fermer la fenetre modale
{
    event.preventDefault()
    event.stopPropagation()
    modal.close();
}

function CheckFocus(modal) // Fermer la fenetre si on clique en dehors
{
    document.addEventListener("click", (event) => {
        if(event.target.id === modal.id)
        {
            CloseModal(modal,event);
        }
    })
}

async function CreateModalHTML () // Affichage du contenu dynamique de la fenetre modale
{
    const data = await fetch(`${url}works`);
    const works = await data.json();
    let display = "";    

    for (let id of works)
    {
        display +=` <article class="card">
                        <div class="img">
                            <div class="icon">
                                <a href="" class="hide"><i class="fa-solid fa-arrows-up-down-left-right"></i></a>
                                <a href="" id="delete${id.id}"><i class="fa-solid fa-trash"></i></a>
                            </div>
                            <img src="${id.imageUrl}" alt="${id.title}">
                        </div>
                        <a href="" id="edit">éditer</a>
                    </article>`
        document.querySelector("#work-edit").innerHTML = display;
    }

    for (let id of works)
    {
        document.getElementById(`delete${id.id}`).addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            DeleteWork(id.id);
        })
    }
}

function ModalWindow () // Affichage et fermeture de la fenetre modale
{
    const modal = document.getElementById('modal-window');
    const edit = document.getElementById('edit-window');
    const login = sessionStorage.getItem("token");

    if(login!=null)
    {
        document.getElementById('edit-button').addEventListener("click", (event) => {
            OpenModal(modal,event);
            CreateModalHTML();
        })

        document.getElementById('close').addEventListener("click", (event) => {
            CloseModal(modal,event);
        })

        document.getElementById('add-button').addEventListener("click", (event) => {
            CloseModal(modal,event);
            OpenModal(edit,event);
            EditWindow();
        })

        CheckFocus(modal);
    }
} 


function EditWindow () // Affichage et fermeture de la fenetre modale d'edition
{
    const modal = document.getElementById('modal-window');
    const edit = document.getElementById('edit-window');
    const display = `<i class="fa-solid fa-image fa-2xl"></i>
                    <label for="form-file" class="add-label">Ajouter photo</label>
                    <input type="file" name="file" id="form-file">
                    <p>jpg, png : 4mo max</p>`;

    document.getElementById('close').addEventListener("click", (event) => {
        CloseModal(modal,event);
    })

    document.getElementById('return').addEventListener("click", (event) => {
        CloseModal(edit,event);
        OpenModal(modal,event);
        CreateModalHTML();
    })

    document.getElementById('thumbnail').innerHTML = display;

    CheckFocus(edit);

    DisplayForm();
}

function CheckForm (file, title, category) // Test du contenu des formulaires et retourne si correct
{
    const button = document.getElementById('validate');

    if(file === undefined || title === "")
    { 
        button.classList.remove('button-enabled');
        button.classList.add('button-disabled');
        return(false);
    }
    else
    {
        button.classList.remove('button-disabled');
        button.classList.add('button-enabled');
        return(true);
    }
}

async function DisplayThumbnail (image)
{
    const thumbnail = document.getElementById('thumbnail');
    const reader = new FileReader();
    let img = document.createElement("img");

    if(image)
    {
        reader.readAsDataURL(image);
    }
    
    reader.addEventListener("load", () => {
        //img.src = reader.result;
        img.setAttribute('src',reader.result);
        img.setAttribute('class','thumbnail');
        console.log(img);
    }, false);

    while(thumbnail.hasChildNodes())
    {
        thumbnail.removeChild(thumbnail.firstChild);
    }

    thumbnail.append(img);
}

async function DisplayForm () // Affiche et rend interactif le formulaire d'ajout d'image
{
    const works = await GetCategory();
    const select = document.getElementById('category-select');
    const file = document.getElementById('form-file');
    const title = document.getElementById('form-title');
    const button = document.getElementById('validate');
    const edit = document.getElementById('edit-window');
    let formData = new FormData();
    let image; 
    let category = 1;
    let check = false;

    file.addEventListener("change", (event) => {
        if(event.target.files[0])
        {
            image = event.target.files[0]
            CheckForm(image, title.value, category);
            check = CheckForm(image, title.value, category);
            DisplayThumbnail (image);
        }
    })

    title.addEventListener("input", (event) => {
        CheckForm(image, title.value, category);
        check = CheckForm(image, title.value, category);
    })

    while(select.hasChildNodes())
    {
        select.removeChild(select.firstChild);
    }

    for (let id of works)
    {
        let option = document.createElement('option');

        option.setAttribute('value',`${id.name}`);
        option.innerText = `${id.name}`;

        select.append(option);

        option.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            category = id.id;
            CheckForm(image, title.value, category);
        })
    }

    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if(check===true)
        {
            formData.append("image", image);
            formData.append("title", title.value);
            formData.append("category", category); 

            AddWork(formData);
            CloseModal(edit);
            title.value="";
        }
    })
    
}

/* Execution du programme au chargement de la page */

async function MakeWebsite ()
{
    await DisplayCategory();
    InitiateFilter();
    CheckLogin();
    ModalWindow();
}

MakeWebsite ();
