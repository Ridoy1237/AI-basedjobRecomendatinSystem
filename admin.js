
// ==========================================
// 1. ADMIN DASHBOARD ELEMENTS
// ==========================================

const adminJobForm = document.getElementById("adminJobForm");

const adminJobsContainer =
    document.getElementById("adminJobsContainer");

const adminApplicationsContainer =
    document.getElementById("adminApplicationsContainer");


// ==========================================
// 2. SAVE JOBS
// ==========================================

function saveAdminJobs() {

    localStorage.setItem(
        "allJobs",
        JSON.stringify(jobs)
    );

}


// ==========================================
// 3. GET APPLICATIONS
// ==========================================

function getApplications() {

    return JSON.parse(
        localStorage.getItem("jobApplications") || "[]"
    );

}


// ==========================================
// 4. DASHBOARD STATISTICS
// ==========================================

function updateDashboardStats() {

    const applications = getApplications();

    document.getElementById("totalJobs").textContent =
        jobs.length;

    document.getElementById("totalApplications").textContent =
        applications.length;

    const pendingCount = applications.filter(function(application) {

        return application.status === "Pending";

    }).length;

    document.getElementById("pendingApplications").textContent =
        pendingCount;

}


// ==========================================
// 5. DISPLAY JOBS
// ==========================================

function displayAdminJobs() {

    adminJobsContainer.innerHTML = "";

    if (jobs.length === 0) {

        adminJobsContainer.innerHTML = "<p>No jobs available.</p>";

        updateDashboardStats();

        return;

    }


    jobs.forEach(function(job) {

        const card = document.createElement("div");

        card.className = "job-item";


        const title = document.createElement("h3");
        title.textContent = job.title;

        const company = document.createElement("p");
        company.textContent = "Company: " + job.company;

        const type = document.createElement("p");
        type.textContent = "Type: " + job.type;

        const location = document.createElement("p");
        location.textContent = "Location: " + job.location;

        const skills = document.createElement("p");
        skills.textContent = "Skills: " + job.skills.join(", ");


        const editButton = document.createElement("button");

        editButton.textContent = "Edit Job";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", function() {

            editJob(job.id);

        });


        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete Job";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {

            deleteJob(job.id);

        });


        card.appendChild(title);
        card.appendChild(company);
        card.appendChild(type);
        card.appendChild(location);
        card.appendChild(skills);
        card.appendChild(editButton);
        card.appendChild(deleteButton);

        adminJobsContainer.appendChild(card);

    });


    updateDashboardStats();

}


// ==========================================
// 6. ADD OR UPDATE JOB
// ==========================================

adminJobForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const editingId =
        document.getElementById("editingJobId").value;


    const newJob = {

        id: editingId ? Number(editingId) : Date.now(),

        title: document.getElementById("adminJobTitle").value.trim(),

        company: document.getElementById("adminCompany").value.trim(),

        type: document.getElementById("adminJobType").value,

        location: document.getElementById("adminLocation").value.trim(),

        description:
            document.getElementById("adminDescription").value.trim(),

        skills: document.getElementById("adminSkills").value
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill !== "")

    };


    if (editingId) {

        // Update existing job
        jobs = jobs.map(function(job) {

            return job.id === Number(editingId)
                ? newJob
                : job;

        });

    } else {

        // Add new job
        jobs.push(newJob);

    }


    saveAdminJobs();

    adminJobForm.reset();

    document.getElementById("editingJobId").value = "";

    document.getElementById("jobFormHeading").textContent =
        "Add New Job";

    document.getElementById("jobSubmitButton").textContent =
        "Add Job";

    document.getElementById("cancelEditButton").hidden = true;


    document.getElementById("adminMessage").textContent =
        editingId ? "Job updated successfully!" : "Job added successfully!";

    document.getElementById("adminMessage").style.color = "green";


    displayAdminJobs();

});


// ==========================================
// 7. EDIT JOB
// ==========================================

function editJob(jobId) {

    const selectedJob = jobs.find(function(job) {

        return job.id === jobId;

    });


    if (!selectedJob) {
        return;
    }


    document.getElementById("editingJobId").value =
        selectedJob.id;

    document.getElementById("adminJobTitle").value =
        selectedJob.title;

    document.getElementById("adminCompany").value =
        selectedJob.company;

    document.getElementById("adminJobType").value =
        selectedJob.type;

    document.getElementById("adminLocation").value =
        selectedJob.location;

    document.getElementById("adminDescription").value =
        selectedJob.description;

    document.getElementById("adminSkills").value =
        selectedJob.skills.join(", ");


    document.getElementById("jobFormHeading").textContent =
        "Edit Job";

    document.getElementById("jobSubmitButton").textContent =
        "Update Job";

    document.getElementById("cancelEditButton").hidden = false;


    document.getElementById("adminJobForm").scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================
// 8. CANCEL EDIT
// ==========================================

document.getElementById("cancelEditButton")
    .addEventListener("click", function() {

        adminJobForm.reset();

        document.getElementById("editingJobId").value = "";

        document.getElementById("jobFormHeading").textContent =
            "Add New Job";

        document.getElementById("jobSubmitButton").textContent =
            "Add Job";

        this.hidden = true;

    });


// ==========================================
// 9. DELETE JOB
// ==========================================

function deleteJob(jobId) {

    const confirmation = confirm(
        "Are you sure you want to delete this job?"
    );

    if (!confirmation) {
        return;
    }


    jobs = jobs.filter(function(job) {

        return job.id !== jobId;

    });


    saveAdminJobs();

    displayAdminJobs();


    document.getElementById("adminMessage").textContent =
        "Job deleted successfully!";

    document.getElementById("adminMessage").style.color = "green";

}


// ==========================================
// 10. DISPLAY APPLICATIONS
// ==========================================

function displayAdminApplications() {

    adminApplicationsContainer.innerHTML = "";

    const applications = getApplications();


    if (applications.length === 0) {

        adminApplicationsContainer.innerHTML =
            "<p>No student applications found.</p>";

        updateDashboardStats();

        return;

    }


    applications.slice().reverse().forEach(function(application) {

        const card = document.createElement("div");

        card.className = "application-item";


        const title = document.createElement("h3");
        title.textContent = application.jobTitle;

        const student = document.createElement("p");
        student.textContent = "Student: " + application.studentName;

        const email = document.createElement("p");
        email.textContent = "Email: " + application.email;

        const company = document.createElement("p");
        company.textContent = "Company: " + application.company;

        const date = document.createElement("p");
        date.textContent = "Applied Date: " + application.appliedAt;

        const coverLetter = document.createElement("p");
        coverLetter.textContent =
            "Cover Letter: " + application.coverLetter;


        const statusLabel = document.createElement("label");
        statusLabel.textContent = "Application Status";


        const statusSelect = document.createElement("select");

        ["Pending", "Accepted", "Rejected"].forEach(function(status) {

            const option = document.createElement("option");

            option.value = status;
            option.textContent = status;

            statusSelect.appendChild(option);

        });


        statusSelect.value = application.status || "Pending";


        const saveButton = document.createElement("button");

        saveButton.textContent = "Update Status";


        saveButton.addEventListener("click", function() {

            const updatedApplications = getApplications();

            const selectedApplication = updatedApplications.find(function(item) {

                return item.id === application.id;

            });


            if (selectedApplication) {

                selectedApplication.status = statusSelect.value;

                localStorage.setItem(
                    "jobApplications",
                    JSON.stringify(updatedApplications)
                );

                alert("Application status updated successfully!");

                displayAdminApplications();

            }

        });


        card.appendChild(title);
        card.appendChild(student);
        card.appendChild(email);
        card.appendChild(company);
        card.appendChild(date);
        card.appendChild(coverLetter);
        card.appendChild(statusLabel);
        card.appendChild(statusSelect);
        card.appendChild(saveButton);

        adminApplicationsContainer.appendChild(card);

    });


    updateDashboardStats();

}


// ==========================================
// 11. INITIALIZE ADMIN DASHBOARD
// ==========================================

displayAdminJobs();

displayAdminApplications();
