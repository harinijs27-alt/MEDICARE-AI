let medicines =
JSON.parse(localStorage.getItem("medicines")) || [];

let activeReminder = null;
let reminderLoop;

// =========================
// CLOCK
// =========================
function updateClock(){
  const clock = document.getElementById("clock");
  if(clock){
    clock.innerHTML = new Date().toLocaleTimeString();
  }
}
setInterval(updateClock, 1000);

// =========================
// LOGIN
// =========================
function loginPatient(){

  const name = document.getElementById("patientName").value;
  const age = document.getElementById("patientAge").value;
  const phone = document.getElementById("patientPhone").value;
  const caregiver = document.getElementById("caregiverLogin").value;

  if(!name || !age || !phone || !caregiver){
    alert("Please fill all fields");
    return;
  }

  localStorage.setItem("patientName", name);
  localStorage.setItem("patientAge", age);
  localStorage.setItem("patientPhone", phone);
  localStorage.setItem("caregiver", caregiver);

  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboardSection").style.display = "block";

  document.getElementById("welcomeText").innerHTML = `👋 Hi, ${name}!`;

  loadProfile();
  loadMedicines();
  loadLogs();
}

// =========================
// AUTO LOGIN
// =========================
window.onload = function(){
  updateClock();

  const patient = localStorage.getItem("patientName");

  if(patient){
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";

    document.getElementById("welcomeText").innerHTML = `👋 Hi, ${patient}!`;

    loadProfile();
    loadMedicines();
    loadLogs();
  }
};

// =========================
// PROFILE
// =========================
function loadProfile(){

  const profile = document.getElementById("patientProfile");
  if(!profile) return;

  profile.innerHTML =
  `Name: ${localStorage.getItem("patientName")}<br>
   Age: ${localStorage.getItem("patientAge")}<br>
   Phone: ${localStorage.getItem("patientPhone")}`;
}

// =========================
// ADD MEDICINE
// =========================
function addMedicine(){

  const name = document.getElementById("medicineName").value;
  const dosage = document.getElementById("dosage").value;
  const time = document.getElementById("medicineTime").value;

  if(!name || !dosage || !time){
    alert("Fill all medicine details");
    return;
  }

  medicines.push({
    name,
    dosage,
    time,
    status: "Pending"
  });

  localStorage.setItem("medicines", JSON.stringify(medicines));

  addLog(`${name} added`);

  loadMedicines();
}

// =========================
// LOAD MEDICINES
// =========================
function loadMedicines(){

  const list = document.getElementById("medicineList");
  if(!list) return;

  list.innerHTML = "";

  medicines.forEach((med,index)=>{

    const li = document.createElement("li");

    li.innerHTML =
    `<b>${med.name}</b><br>
     Dosage: ${med.dosage}<br>
     Time: ${med.time}<br>
     Status: ${med.status}<br><br>

     <button onclick="markTaken(${index})">
     Taken
     </button>`;

    list.appendChild(li);
  });
}

// =========================
// MARK TAKEN
// =========================
function markTaken(index){

  medicines[index].status = "Taken";

  localStorage.setItem("medicines", JSON.stringify(medicines));

  speechSynthesis.cancel();
  clearInterval(reminderLoop);

  activeReminder = null;

  addLog(medicines[index].name + " taken");

  loadMedicines();
}

// =========================
// REMINDER CHECK
// =========================
function checkReminders(){

  const currentTime = new Date().toTimeString().substring(0,5);

  medicines.forEach((medicine,index)=>{

    if(medicine.time === currentTime && medicine.status === "Pending"){
      triggerReminder(medicine,index);
    }

  });

}
setInterval(checkReminders, 1000);

// =========================
// REMINDER ALERT
// =========================
function triggerReminder(medicine,index){

  if(activeReminder === index) return;

  activeReminder = index;

  reminderLoop = setInterval(()=>{

    const speech = new SpeechSynthesisUtterance(
      `Time to take ${medicine.name}`
    );

    speech.lang = "en-US";
    speechSynthesis.speak(speech);

  },5000);

  addLog("Reminder started for " + medicine.name);

  document.getElementById("nextReminder").innerHTML =
  `${medicine.name} (${medicine.time})`;

  // =========================
  // MISS AFTER 1 MINUTE
  // =========================
  setTimeout(()=>{

    clearInterval(reminderLoop);

    if(medicines[index].status === "Pending"){

      medicines[index].status = "Missed";

      localStorage.setItem("medicines", JSON.stringify(medicines));

      addLog(medicine.name + " missed");

      // ✔ SMS FIRST (IMPORTANT)
      sendMissedSMS(medicine);

      loadMedicines();
    }

  },60000);
}

// =========================
// SMS FUNCTION (FIXED)
// =========================
function sendMissedSMS(medicine){

  const caregiver = localStorage.getItem("caregiver");
  if(!caregiver) return;

  const smsText =
  encodeURIComponent(
    `Medicine Missed Alert\n` +
    `Medicine: ${medicine.name}\n` +
    `Time: ${medicine.time}`
  );

  // OPEN SMS APP
  window.location.href =
  `sms:${caregiver}?body=${smsText}`;

  // OPTIONAL CALL (user-trigger safe)
  setTimeout(()=>{
    const confirmCall = confirm("Call caregiver now?");
    if(confirmCall){
      window.location.href = `tel:${caregiver}`;
    }
  }, 4000);
}

// =========================
// LOG SYSTEM
// =========================
function addLog(message){

  let logs = JSON.parse(localStorage.getItem("logs")) || [];

  logs.unshift(new Date().toLocaleString() + " - " + message);

  localStorage.setItem("logs", JSON.stringify(logs));

  loadLogs();
}

function loadLogs(){

  const list = document.getElementById("logList");
  if(!list) return;

  list.innerHTML = "";

  const logs = JSON.parse(localStorage.getItem("logs")) || [];

  logs.forEach(log=>{
    const li = document.createElement("li");
    li.innerHTML = log;
    list.appendChild(li);
  });
}

// =========================
// OTHER FEATURES
// =========================
function callAmbulance(){
  addLog("Calling ambulance");
  window.location.href = "tel:108";
}

function toggleDarkMode(){
  document.body.classList.toggle("dark-mode");
}

function logout(){
  localStorage.removeItem("patientName");
  location.reload();
}
