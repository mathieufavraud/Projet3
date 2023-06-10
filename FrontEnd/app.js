//const url = await GetUrl(); // Récupération url serveur
async function GetCategory() {
  // Récuperation des catégories sur le serveur
  const url = await GetUrl();
  const data = await fetch(`${url}categories`);
  const works = await data.json();

  return works;
}

/* Affichage des boutons */

function CreateCategoryHTML(name, id, content, filterID) {
  // Création du html pour chaque element filtre, et intégration dans le DOM
  let button = document.createElement("button");

  button.classList.add(`${name}`);
  button.id = `${id}`;
  button.innerHTML = content;
  document.querySelector("#filters").append(button);
  button.addEventListener("click", (e) => {
    DisplayFilter(filterID);
    DisplayWorks(filterID);
  });
}

async function DisplayCategory() {
  // Conditions initiale pour l'affichage des catégories
  const works = await GetCategory();
  const login = sessionStorage.getItem("token");

  if (login != null) {
    //DisplayWorks(0);
  } else {
    CreateCategoryHTML("filter", "all", "Tous", 0);

    for (let id of works) {
      CreateCategoryHTML("filter", id.name, id.name, id.id);
    }
  }
}

/* Initialisation et alternance des filtres */

function InitiateFilter() {
  // Etat initial des filtres et images
  const login = sessionStorage.getItem("token");

  if (login != null) {
    DisplayWorks(0);
  } else {
    DisplayFilter(0);
    DisplayWorks(0);
  }
}

function DisplayFilter(filterID) {
  // Affichage du css des filtres si cliqué
  const buttons = document.getElementById("filters").childNodes;

  for (let filter = 0; filter < buttons.length; filter++) {
    buttons[filter].classList.remove("activated");
  }
  buttons[filterID].classList.add("activated");
}

/* Affichage des images */

function CreateImageHTML(works) {
  // Création du html pour chaque element image et intégration dans le DOM
  gallery = document.querySelector("#gallery");

  while (gallery.hasChildNodes()) {
    gallery.removeChild(gallery.firstChild);
  }

  for (let id of works) {
    let img = document.createElement("img");
    let caption = document.createElement("figcaption");
    let figure = document.createElement("figure");

    img.setAttribute("src", `${id.imageUrl}`);
    img.setAttribute("alt", `${id.title}`);
    caption.innerText = `${id.title}`;
    figure.append(img, caption);

    gallery.append(figure);
  }
}

async function DisplayWorks(filterID) {
  // Récupération des travaux sur le serveur
  const url = await GetUrl();
  const data = await fetch(`${url}works`);
  const works = await data.json();

  if (filterID != 0) {
    let filtered_works = works.filter((works) => works.categoryId == filterID);

    CreateImageHTML(filtered_works);
  } else {
    CreateImageHTML(works);
  }
}

/* Vérification Login */

function CheckLogin() {
  // Vérification de la presence du token utilisateur
  const login = sessionStorage.getItem("token");
  let buttons = document.getElementsByClassName("edition-button");

  if (login != null) {
    document.getElementById("edition").classList.remove("hidden");
    document.getElementById("logout").classList.remove("hidden");
    document.getElementById("login").classList.add("hidden");

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove("hidden");
    }
  }
  document.getElementById("logout").addEventListener("click", (e) => {
    sessionStorage.removeItem("token");
    location.reload();
  });
}

/* Fonctions de la fenetre modale */

async function DeleteWork(id) {
  // Suppression travaux
  const token = sessionStorage.getItem("token");
  const url = await GetUrl();
  const data = await fetch(`${url}works/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  await DisplayWorks(0);
  // rappel affichage de la modale
  //let answer = await data.json();
}

async function AddWork(formData) {
  // Ajout travaux
  const token = sessionStorage.getItem("token");
  const url = await GetUrl();
  const data = await fetch(`${url}works`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  //let answer = await data.json();

  await DisplayWorks(0);
}

function OpenModal(modal, event) {
  // Ouvrir la fenetre modale
  event.preventDefault();
  event.stopPropagation();
  modal.showModal();
}

function CloseModal(modal, event) {
  // Fermer la fenetre modale
  event.preventDefault();
  event.stopPropagation();

  if (modal.id === "edit-window") {
    const title = document.getElementById("form-title");
    const file = document.getElementById("form-file");
    title.value = "";
    file.value = "";
  }

  modal.close();
}

function CheckFocus(modal) {
  // Fermer la fenetre si on clique en dehors
  document.addEventListener("click", (event) => {
    if (event.target.id === modal.id) {
      CloseModal(modal, event);
    }
  });
}

function DeleteCard(id) {
  // Supprimer du DOM la carte dont l'entrée a été delete
  card = document.getElementById(`card${id}`);

  card.remove();
}

async function CreateModalHTML() {
  // Affichage du contenu dynamique de la fenetre modale
  const url = await GetUrl();
  const data = await fetch(`${url}works`);
  const works = await data.json();
  let display = "";

  for (let id of works) {
    display += ` <article class="card" id="card${id.id}">
                        <div class="img">
                            <div class="icon">
                                <a href="" class="hide"><i class="fa-solid fa-arrows-up-down-left-right"></i></a>
                                <a href="" id="delete${id.id}"><i class="fa-solid fa-trash"></i></a>
                            </div>
                            <img src="${id.imageUrl}" alt="${id.title}">
                        </div>
                        <a href="" id="edit">éditer</a>
                    </article>`;
    document.querySelector("#work-edit").innerHTML = display;
  }

  for (let id of works) {
    document
      .getElementById(`delete${id.id}`)
      .addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        DeleteWork(id.id);
        DeleteCard(id.id);
      });
  }
}

function ModalWindow() {
  // Affichage et fermeture de la fenetre modale
  const modal = document.getElementById("modal-window");
  const edit = document.getElementById("edit-window");
  const login = sessionStorage.getItem("token");

  if (login != null) {
    document
      .getElementById("edit-button")
      .addEventListener("click", (event) => {
        OpenModal(modal, event);
        CreateModalHTML();
      });

    document.getElementById("close").addEventListener("click", (event) => {
      CloseModal(modal, event);
    });

    document.getElementById("add-button").addEventListener("click", (event) => {
      CloseModal(modal, event);
      OpenModal(edit, event);
      EditWindow();
    });

    CheckFocus(modal);
  }
}

function EditWindow() {
  // Affichage et fermeture de la fenetre modale d'edition
  const modal = document.getElementById("modal-window");
  const edit = document.getElementById("edit-window");

  document.getElementById("close2").addEventListener("click", (event) => {
    CloseModal(edit, event);
  });

  document.getElementById("return").addEventListener("click", (event) => {
    CloseModal(edit, event);
    OpenModal(modal, event);
    CreateModalHTML();
  });

  CheckFocus(edit);

  DisplayForm();
}

function CheckForm(file, title, category) {
  // Test du contenu des formulaires et retourne si correct
  const button = document.getElementById("validate");

  if (file === undefined || title === "" || category === 0) {
    button.classList.remove("button-enabled");
    button.classList.add("button-disabled");
    return false;
  } else {
    button.classList.remove("button-disabled");
    button.classList.add("button-enabled");
    return true;
  }
}

async function DisplayThumbnail(image) {
  const thumbnail = document.getElementById("thumbnail");
  const form = document.getElementById("add-photo-form");
  const reader = new FileReader();
  let img = document.createElement("img");

  if (image) {
    reader.readAsDataURL(image);
  }

  reader.addEventListener(
    "load",
    () => {
      img.setAttribute("src", reader.result);
      img.setAttribute("class", "thumbnail");
    },
    false
  );

  while (thumbnail.hasChildNodes()) {
    thumbnail.removeChild(thumbnail.firstChild);
  }

  form.classList.add("hidden");
  thumbnail.classList.remove("hidden");
  thumbnail.append(img);
}

function CheckFile(file) {
  //Verifie le contenu et la taille du fichier

  if (file.type === "image/jpeg" || file.type === "image/png") {
    if (file.size <= 4000000) {
      DisplayThumbnail(file);
      return true;
    } else {
      alert("jpg, png : 4mo max");
      return false;
    }
  } else {
    alert("jpg, png : 4mo max");
    return false;
  }
}

async function DisplayForm() {
  // Affiche et rend interactif le formulaire d'ajout d'image
  const works = await GetCategory();
  const select = document.getElementById("category-select");
  const input = document.getElementById("form-file");
  const title = document.getElementById("form-title");
  const button = document.getElementById("validate");
  const edit = document.getElementById("edit-window");
  const form = document.getElementById("add-photo-form");
  const thumbnail = document.getElementById("thumbnail");
  let image = "";
  let category = 0;
  let check = false;

  form.classList.remove("hidden");
  thumbnail.classList.add("hidden");

  input.addEventListener("change", (event) => {
    if (event.target.files[0]) {
      let file = event.target.files[0];
      if (CheckFile(file));
      {
        check = CheckForm(file, title.value, category);
        image = file;
      }
    }
  });

  title.addEventListener("input", (event) => {
    check = CheckForm(image, title.value, category);
  });

  while (select.hasChildNodes()) {
    select.removeChild(select.firstChild);
  }

  let option = document.createElement("option");

  option.setAttribute("value", "0");
  select.append(option);
  option.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    check = CheckForm(image, title.value, category);
  });

  for (let id of works) {
    let option = document.createElement("option");

    option.setAttribute("value", `${id.name}`);
    option.innerText = `${id.name}`;

    select.append(option);

    option.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      category = id.id;
      check = CheckForm(image, title.value, category);
    });
  }

  button.onclick = (event) => {
    if (check === true) {
      let formData = new FormData();

      formData.append("image", image);
      formData.append("title", title.value);
      formData.append("category", category);

      AddWork(formData);
      CloseModal(edit, event);
      check = false;
    }
  };
}

/* Execution du programme au chargement de la page */

async function MakeWebsite() {
  await DisplayCategory();
  InitiateFilter();
  CheckLogin();
  ModalWindow();
}

MakeWebsite();
