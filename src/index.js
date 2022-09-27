/**.
 * //Assignment one: firebase project
 * pre project steps:
 * creating own firebase project, app and database.
 * insertion of config object into the js file
 *
 * FUNCTIONALITY:
 * 1. READS a list of people from the data, displays their names, birhtdays and months
 * 2. first person automatically selected and the gifts of person is displayed
 * 3. clicking on a person list item READS all gift ideas from that person and displays
 * it as contents of the second list
 * 5. if either list is empty, a message is displayed "no data"
 * 6. clicking on ADD buttons should show the overlay plus the form
 * 7. once form is filled, when user clicks save, the new item should be added to database
 * as well as updated list
 * 8. the bought value should be displayed as a checkbox
 * 9. each item should have a delete button
 * 10. the delete button should delelte from database and UI
 * 11. each item should have a functional edit button
 * 12. toggling checkbox for gift should do an update in DB
 * 13. FINAL, host on github pages
 *
 *
 *
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore, //initialze firestore service
  collection,
  query,
  where,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  arrayRemove,
  DocumentReference,
} from "firebase/firestore";

// Your web app's Firebase configuration object
//next step: connect to firebase project from the front end
const firebaseConfig = {
  apiKey: "AIzaSyAO23Vn0VmMWHP11CYoUWshK7bpL_iTTnI",
  authDomain: "fire-giftr-fce59.firebaseapp.com",
  projectId: "fire-giftr-fce59",
  storageBucket: "fire-giftr-fce59.appspot.com",
  messagingSenderId: "619977319882",
  appId: "1:619977319882:web:0cc81a9f47160221a31b33",
  measurementId: "G-11CPY45CG8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); //connects to firebase backend
const db = getFirestore(app); //referenece for the db
let personId = "";
let giftId = "";
let people = [];

// Reference to the element to be deleted from the list if user is to be deleted
let personToDeleteElem = null;

const months = [
  "January",
  "Feburaray",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

document.addEventListener("DOMContentLoaded", async () => {
  await getPeople();
  //set up the dom events
  initializeEventListeners();
});

function initializeEventListeners() {
  document
    .getElementById("btnCancelPerson")
    .addEventListener("click", hideOverlay);

  document
    .getElementById("btnCancelIdea")
    .addEventListener("click", hideOverlay);

  document.querySelector(".overlay").addEventListener("click", hideOverlay);

  document
    .getElementById("btnAddPerson")
    .addEventListener("click", showOverlay);

  document.getElementById("btnAddIdea").addEventListener("click", showOverlay);

  document
    .getElementById("btnCreatePerson")
    .addEventListener("click", createPerson);

  document
    .getElementById("btnCreateIdea")
    .addEventListener("click", createIdea);

  document
    .querySelectorAll(".person")
    .forEach((elem) => elem.addEventListener("click", handleSelectPerson));

  document
    .getElementById("btnCancelPerson")
    .addEventListener("click", hideEditPersonOverlay);

  document
    .getElementById("noDeletePerson")
    .addEventListener("click", hideDeletePersonOverlay);
}

function hideOverlay(ev) {
  ev.preventDefault();
  if (
    !ev.target.classList.contains("overlay") &&
    ev.target.id != "btnCancelIdea" &&
    ev.target.id != "btnCancelPerson" &&
    ev.target.id != "btnSaveIdea" &&
    ev.target.id != "btnSavePerson"
  )
    return;
  document.getElementById("titleAdd").value = "";
  document.getElementById("locationAdd").value = "";
  document.getElementById("titleEdit").value = "";
  document.getElementById("locationEdit").value = "";
  document.getElementById("name").value = "";
  document.getElementById("day").value = "";
  document.getElementById("month").value = "";
  document.querySelector(".overlay").classList.remove("active");
  document
    .querySelectorAll(".overlay dialog")
    .forEach((dialog) => dialog.classList.remove("active"));
}

function showOverlay(ev) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.add("active");
  const id = ev.target.id === "btnAddPerson" ? "dlgPerson" : "dlgIdea";
  document.getElementById(id).classList.add("active");
}

function showEditPersonOverlay(ev, element, person) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.add("active");
  document.getElementById("editPerson").classList.add("active");

  document.getElementById("nameEdit").value = person["name"];
  document.getElementById("monthEdit").value = person["birth-month"];
  document.getElementById("dayEdit").value = person["birth-day"];

  document
    .getElementById("btnSaveIdea")
    .addEventListener("click", (event) => updatePerson(event, element, person));
}

function showDeletePersonOverlay(ev, element, person) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.add("active");
  document.getElementById("deletePersonSection").classList.add("active");

  document
    .getElementById("yesDeletePerson")
    .addEventListener("click", (event) => deletePerson(event, element, person));
}

function showEditIdeaOverlay(ev, element, idea) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.add("active");
  document.getElementById("editIdea").classList.add("active");

  document.getElementById("titleEdit").value = element.children[1].children[0].innerHTML;
  document.getElementById("locationEdit").value = element.children[1].children[1].innerHTML;

  document
    .getElementById("btnSaveIdea")
    .addEventListener("click", (event) => updateIdea(event, element, idea));
}

function showDeleteIdeaOverlay(ev, element, idea) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.add("active");
  document.getElementById("deleteIdea").classList.add("active");

  document
    .getElementById("yesDeleteIdea")
    .addEventListener("click", (event) => deleteIdea(event, element, idea));
}

function hideEditPersonOverlay(ev, element, person) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.remove("active");
  document.getElementById("editPerson").classList.remove("active");

  document
    .getElementById("btnSaveIdea")
    .addEventListener("click", (event) => updatePerson(event, element, person));
}

function hideDeletePersonOverlay(ev) {
  ev.preventDefault();
  document.querySelector(".overlay").classList.remove("active");
  document.getElementById("deletePersonSection").classList.remove("active");

  document
    .getElementById("deletePersonSection")
    .setAttribute("data-id", personId);
}

/**people functionality */
//getPerson functionality
async function getPeople() {
  const querySnapshot = await getDocs(collection(db, "people")); //get a reference to the people collection
  querySnapshot.forEach((doc) => {
    //getting the data
    const data = doc.data();
    const id = doc.id;
    people.push({ id, ...data });
  });
  buildPeople(people);
}

//build person functionality
function buildPeople(people) {
  //build the HTML
  let list = document.querySelector(".person-list");
  list.innerHTML = people
    .map((person) => {
      const dob = `${months[person["birth-month"] - 1]} ${person["birth-day"]}`;
      return `<div data-id="${person.id}" class="person">
               <p class="name">${person.name}</p>
               <p class="dob">${dob}</p>
               <div class="personButtons">
                <button class="editPerson" data-id="${person.id}">Edit</button>
                <button class="deletePerson" data-id="${person.id}">Delete</button>
              </div>
             </div>
              `;
    })
    .join("");

  const elements = document.querySelectorAll(".person");
  elements.forEach((element) => {
    let editBtn = element.children[2].children[0];
    let deleteBtn = element.children[2].children[1];
    let person = people.filter(
      (person) => person.id === element.getAttribute("data-id")
    )[0];

    editBtn.addEventListener("click", (event) =>
      showEditPersonOverlay(event, element, person)
    );
    deleteBtn.addEventListener("click", (event) =>
      showDeletePersonOverlay(event, element, person)
    );
  });
}

function showPerson(person) {
  const list = document.querySelector(".person-list");
  const dob = `${months[person["birth-month"] - 1]} ${person["birth-day"]}`;
  list.innerHTML += `<div data-id="${person.id}" class="person">
      <p class="name">${person.name}</p>
      <p class="dob">${dob}</p>
      <div class="personButtons">
        <button class="editPerson" data-id="${person.id}">Edit</button>
        <button class="deletePerson" data-id="${person.id}">Delete</button>
      </div>
    </div>`;

  //add to people array
  people.push(person);
}

function handleSelectPerson(ev) {
  const person = ev.target.closest(".person");
  const id = person ? person.getAttribute("data-id") : null;
  //when user clicks on edit or delete person
  if (id) {
    document.querySelector("div.selected")?.classList.remove("selected");
    person.classList.add("selected");
    getIdeas(id);
  }
}

async function updateIdea(ev, element, idea) {
  ev.preventDefault();
  const ideaRef = doc(collection(db, "gift-ideas"), idea.id);

  let title = document.getElementById("titleEdit").value;
  let location = document.getElementById("locationEdit").value;

  let a = await updateDoc(ideaRef, {
    title: title,
    location: location,
  });

  document.querySelector(".overlay").classList.remove("active");
  document.getElementById("editIdea").classList.remove("active");

  element.children[1].children[0].innerHTML = title;
  element.children[1].children[1].innerHTML = location;
}

async function updatePerson(ev, element, person) {
  ev.preventDefault();
  const personRef = doc(collection(db, "people"), person.id); //get reference for people

  let name = document.getElementById("nameEdit").value;
  let month = document.getElementById("monthEdit").value;
  let day = document.getElementById("dayEdit").value;

  // To update age and favorite color:
  let a = await updateDoc(personRef, {
    name,
    "birth-month": month,
    "birth-day": day,
  });

  document.querySelector(".overlay").classList.remove("active");
  document.getElementById("editPerson").classList.remove("active");

  element.children[0].innerHTML = name;
  element.children[1].innerHTML = months[month - 1] + " " + day;
}

async function deletePerson(ev, element, person) {
  await deleteDoc(doc(collection(db, "people"), person.id));

  document.querySelector(".overlay").classList.remove("active");
  document.getElementById("deletePersonSection").classList.remove("active");

  if (element) {
    element.remove();
  }
}

async function deleteIdea(ev, element, idea) {
  await deleteDoc(doc(collection(db, "gift-ideas"), idea.id));

  document.querySelector(".overlay").classList.remove("active");
  document.getElementById("deletePersonSection").classList.remove("active");

  if (element) {
    element.remove();
  }
}

async function handleSelectedIdea(ev) {
  const li = ev.target.closest(".idea");
  const id = li ? li.getAttribute("data-id") : null;
  const checked = li.children[0].children[0].checked;

  if (id) {
    const docRef = doc(db, "gift-ideas", id);
    await updateDoc(docRef, {
      bought: checked,
    });
  }
}

async function getIdeas(id) {
  const ideaCollectionRef = collection(db, "gift-ideas"); //get reference for gift teams
  const docs = query(ideaCollectionRef, where("person-id", "==", id));

  const querySnapshot = await getDocs(docs);
  const ideas = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    ideas.push({ id, ...data });
  });

  //now build the HTML from the ideas array
  await buildIdeas(ideas);
}

function buildIdeas(ideas) {
  const list = document.querySelector(".idea-list");
  if (ideas.length) {
    list.innerHTML = ideas
      .map((idea) => {
        return `<div class="idea" data-id="${idea.id}">
                   <label style="width: 100px;" for="chk-${idea.id}"
                     ><input type="checkbox" value="${idea.bought}" id="chk-${idea.id}" /> Bought</label
                   >
                   <div>
                    <p class="title">${idea.title}</p>
                    <p class="location">${idea.location}</p>
                   </div>
                   <div class="buttons">
                    <button class="editIdea" data-id="${idea.id}">Edit</button>
                    <button class="deleteIdea" data-id="${idea.id}">Delete</button>
                   </div>
                 </div>`;
      })
      .join("");

    const elements = document.querySelectorAll(".idea");
    elements.forEach((element) => {
      let checkbox = element.children[0].children[0];
      let editBtn = element.children[2].children[0];
      let deleteBtn = element.children[2].children[1];

      let id = checkbox.id.substring(4);
      let idea = ideas.filter((idea) => idea.id === id)[0];
      let isBought = idea.bought;

      checkbox.addEventListener("click", handleSelectedIdea);
      checkbox.checked = isBought;

      editBtn.addEventListener("click", (event) =>
        showEditIdeaOverlay(event, element, idea)
      );
      deleteBtn.addEventListener("click", (event) =>
        showDeleteIdeaOverlay(event, element, idea)
      );
    });
  } else {
    list.innerHTML =
      '<span class="idea"><p></p><p>No Gift Ideas for selected person.</p></span>'; //clear in case there are no records to shows
  }
}
async function createIdea() {
  let title = document.getElementById("titleAdd").value;
  let location = document.getElementById("locationAdd").value;
  let selectedPerson = document.querySelector('.person.selected');
  let personId = selectedPerson.getAttribute('data-id');

  if (!title || !location) return;

  const idea = {
    title: title,
    location: location,
    bought: false,
    "person-id": personId,
  };

  try {
    const docRef = await addDoc(collection(db, "gift-ideas"), idea);
    idea.id = docRef.id;

    document.getElementById("titleAdd").value = "";
    document.getElementById("locationAdd").value = "";
    document.querySelector(".overlay").click();

    getIdeas(personId);
  } catch (err) {
    console.error("Error adding document: ", err);
  }
}

async function createPerson() {
  //take the information from the dialog, save as an object, push to firestore
  let name = document.getElementById("name").value;
  let month = document.getElementById("month").value;
  let day = document.getElementById("day").value;
  if (!name || !month || !day) return; //form needs more info
  const person = {
    name,
    "birth-month": month,
    "birth-day": day,
  };
  try {
    const docRef = await addDoc(collection(db, "people"), person);
    console.log("Document written with ID: ", docRef.id);
    document.getElementById("name").value = "";
    document.getElementById("month").value = "";
    document.getElementById("day").value = "";
    document.querySelector(".overlay").click();

    person.id = docRef.id;
    showPerson(person);
  } catch (err) {
    console.error("Error adding document: ", err);
  }
}
