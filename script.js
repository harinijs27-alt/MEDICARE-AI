let medicines =
JSON.parse(
localStorage.getItem("medicines")
) || [];

let activeReminder = null;
let reminderLoop;

// CLOCK

function updateClock(){

  const clock =
  document.getElementById("clock");

  if(clock){

    clock.innerHTML =
    new Date().toLocaleTimeString();

  }

}

setInterval(
updateClock,
1000
);

// LOGIN

function loginPatient(){

  const name =
  document.getElementById(
  "patientName"
  ).value;

  const age =
  document.getElementById(
  "patientAge"
  ).value;

  const phone =
  document.getElementById(
  "patientPhone"
  ).value;

  const caregiver =
  document.getElementById(
  "caregiverLogin"
  ).value;

  if(
    !name ||
    !age ||
    !phone ||
    !caregiver
  ){

    alert(
    "Please fill all fields"
    );

    return;

  }

  localStorage.setItem(
  "patientName",
  name
  );

  localStorage.setItem(
  "patientAge",
  age
  );

  localStorage.setItem(
  "patientPhone",
  phone
  );

  localStorage.setItem(
  "caregiver",
  caregiver
  );

  document.getElementById(
  "loginSection"
  ).style.display =
  "none";

  document.getElementById(
  "dashboardSection"
  ).style.display =
  "block";

  document.getElementById(
  "welcomeText"
  ).innerHTML =
  `👋 Hi, ${name}!`;

  loadProfile();

  loadMedicines();

  loadLogs();

}

// AUTO LOGIN

window.onload = function(){

  updateClock();

  const patient =
  localStorage.getItem(
  "patientName"
  );

  if(patient){

    document.getElementById(
    "loginSection"
    ).style.display =
    "none";

    document.getElementById(
    "dashboardSection"
    ).style.display =
    "block";

    document.getElementById(
    "welcomeText"
    ).innerHTML =
    `👋 Hi, ${patient}!`;

    loadProfile();

    loadMedicines();

    loadLogs();

  }

}

// PROFILE

function loadProfile(){

  const profile =
  document.getElementById(
  "patientProfile"
  );

  if(!profile) return;

  profile.innerHTML =

  `
  Name :
  ${localStorage.getItem("patientName")}
  <br><br>

  Age :
  ${localStorage.getItem("patientAge")}
  <br><br>

  Phone :
  ${localStorage.getItem("patientPhone")}
  `;

}

// ADD MEDICINE

function addMedicine(){

  const name =
  document.getElementById(
  "medicineName"
  ).value;

  const dosage =
  document.getElementById(
  "dosage"
  ).value;

  const time =
  document.getElementById(
  "medicineTime"
  ).value;

  if(
    !name ||
    !dosage ||
    !time
  ){

    alert(
    "Fill all medicine details"
    );

    return;

  }

  medicines.push({

    name:name,

    dosage:dosage,

    time:time,

    status:"Pending"

  });

  localStorage.setItem(

  "medicines",

  JSON.stringify(
  medicines
  )

  );

  addLog(
  `${name} added`
  );

  document.getElementById(
  "medicineName"
  ).value = "";

  document.getElementById(
  "dosage"
  ).value = "";

  document.getElementById(
  "medicineTime"
  ).value = "";

  loadMedicines();

}

// LOAD MEDICINES

function loadMedicines(){

  const list =
  document.getElementById(
  "medicineList"
  );

  const report =
  document.getElementById(
  "reportTable"
  );

  if(!list || !report)
  return;

  list.innerHTML = "";

  report.innerHTML = "";

  medicines.forEach(

  (med,index)=>{

    const li =
    document.createElement(
    "li"
    );

    li.innerHTML =

    `
    <b>${med.name}</b>
    <br>

    Dosage :
    ${med.dosage}

    <br>

    Time :
    ${med.time}

    <br><br>

    Status :
    ${med.status}

    <br><br>

    <button
    class="btn success"
    onclick="markTaken(${index})">

    Taken

    </button>

    `;

    list.appendChild(li);

    const row =
    document.createElement(
    "tr"
    );

    row.innerHTML =

    `
    <td>${med.name}</td>
    <td>${med.time}</td>
    <td>${med.status}</td>
    `;

    report.appendChild(
    row
    );

  });

  updateDashboard();

}
// =========================
// MEDICARE AI
// PART 2
// =========================

// DASHBOARD

function updateDashboard(){

  const total =
  medicines.length;

  const taken =
  medicines.filter(
  med =>
  med.status === "Taken"
  ).length;

  const missed =
  medicines.filter(
  med =>
  med.status === "Missed"
  ).length;

  let adherence = 0;

  if(total > 0){

    adherence =
    Math.round(
    (taken / total) * 100
    );

  }

  document.getElementById(
  "totalMedicine"
  ).innerHTML =
  total;

  document.getElementById(
  "takenCount"
  ).innerHTML =
  taken;

  document.getElementById(
  "missedCount"
  ).innerHTML =
  missed;

  document.getElementById(
  "adherence"
  ).innerHTML =
  adherence + "%";

  const reportTotal =
  document.getElementById(
  "reportTotal"
  );

  if(reportTotal){

    document.getElementById(
    "reportTotal"
    ).innerHTML =
    total;

    document.getElementById(
    "reportTaken"
    ).innerHTML =
    taken;

    document.getElementById(
    "reportMissed"
    ).innerHTML =
    missed;

    document.getElementById(
    "reportAdherence"
    ).innerHTML =
    adherence + "%";

  }

}

// MARK TAKEN

function markTaken(index){

  medicines[index].status =
  "Taken";

  localStorage.setItem(

  "medicines",

  JSON.stringify(
  medicines
  )

  );

  const audio =
  document.getElementById(
  "alarm"
  );

  if(audio){

    audio.pause();

    audio.currentTime = 0;

  }

  speechSynthesis.cancel();

clearInterval(reminderLoop);

activeReminder = null;

  addLog(

  medicines[index].name +
  " taken"

  );

  loadMedicines();

}

// LOGS

function addLog(message){

  let logs =
  JSON.parse(

  localStorage.getItem(
  "logs"
  )

  ) || [];

  logs.unshift(

  new Date()
  .toLocaleString()

  +

  " - "

  +

  message

  );

  localStorage.setItem(

  "logs",

  JSON.stringify(
  logs
  )

  );

  loadLogs();

}

function loadLogs(){

  const list =
  document.getElementById(
  "logList"
  );

  if(!list)
  return;

  list.innerHTML = "";

  const logs =
  JSON.parse(

  localStorage.getItem(
  "logs"
  )

  ) || [];

  logs.forEach(log=>{

    const li =
    document.createElement(
    "li"
    );

    li.innerHTML = log;

    list.appendChild(
    li
    );

  });

}

// REMINDER CHECKER

function checkReminders(){

  const currentTime =

  new Date()
  .toTimeString()
  .substring(0,5);

  medicines.forEach(

  (medicine,index)=>{

    if(

      medicine.time ===
      currentTime

      &&

      medicine.status ===
      "Pending"

    ){

      triggerReminder(
      medicine,
      index
      );

    }

  });

}

setInterval(
checkReminders,
1000
);

// REMINDER

function triggerReminder(
medicine,
index
){

  if(
    activeReminder === index
  ){
    return;
  }

  activeReminder =
  index;

  const audio =
  document.getElementById(
  "alarm"
  );

  reminderLoop =
  setInterval(()=>{

    if(audio){

      audio.currentTime = 0;

      audio.play();

    }

    const speech =
    new SpeechSynthesisUtterance(

      `Time to take ${medicine.name}`

    );

    speech.lang =
    "en-US";

    speechSynthesis.speak(
      speech
    );

  },5000);

  document.getElementById(
  "nextReminder"
  ).innerHTML =

  medicine.name +
  " (" +
  medicine.time +
  ")";

  addLog(

    "Reminder started for " +
    medicine.name

  );

  setTimeout(()=>{

    clearInterval(
      reminderLoop
    );

    if(

      medicines[index]
      .status ===
      "Pending"

    ){

      medicines[index]
      .status =
      "Missed";

      localStorage.setItem(

        "medicines",

        JSON.stringify(
          medicines
        )

      );

      addLog(

        medicine.name +
        " missed"

      );

      const caregiver =

      localStorage.getItem(
        "caregiver"
      );

      if(caregiver){

        window.location.href =
        `tel:${caregiver}`;

      }

      loadMedicines();

    }

  },60000);

}

// DARK MODE

function toggleDarkMode(){

  document.body
  .classList.toggle(
  "dark-mode"
  );

}

// CALL CAREGIVER

function callCaregiver(){

  const caregiver =

  localStorage.getItem(
  "caregiver"
  );

  if(caregiver){

    addLog(
    "Calling caregiver"
    );

    window.location.href =
    `tel:${caregiver}`;

  }

}

// AMBULANCE

function callAmbulance(){

  addLog(
  "Calling ambulance"
  );

  window.location.href =
  "tel:108";

}

// DOWNLOAD REPORT

function downloadReport(){

  let reportText =

  "MEDICARE AI REPORT\n\n";

  medicines.forEach(
  medicine=>{

    reportText +=

    medicine.name +
    " | " +

    medicine.time +
    " | " +

    medicine.status +
    "\n";

  });

  const blob =

  new Blob(
  [reportText],
  {type:"text/plain"}
  );

  const a =
  document.createElement(
  "a"
  );

  a.href =
  URL.createObjectURL(
  blob
  );

  a.download =
  "Medicine_Report.txt";

  a.click();

}

// LOGOUT

function logout(){

  localStorage.removeItem(
  "patientName"
  );

  location.reload();

}