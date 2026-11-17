// ==========================================
// 1. START BUTTON
// ==========================================

const startButton = document.getElementById("startBtn");

if (startButton) {
    startButton.addEventListener("click", function() {
        window.location.href = "register.html";
    });
}


// ==========================================
// 2. STUDENT REGISTRATION
// ==========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const university = document.getElementById("university").value;
        const department = document.getElementById("department").value;
        const skills = document.getElementById("skills").value;

        const student = {
            name: name,
            email: email,
            university: university,
            department: department,
            skills: skills.split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== "")
        };

        // Password is not saved in localStorage.
        localStorage.setItem(
            "studentData",
            JSON.stringify(student)
        );

        alert("Welcome " + name + "! Registration successful.");

        window.location.href = "profile.html";

    });

}


// ==========================================
// 3. GET STUDENT DATA
// ==========================================

const savedStudent = localStorage.getItem("studentData");

if (savedStudent) {

    const student = JSON.parse(savedStudent);

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileUniversity = document.getElementById("profileUniversity");
    const profileDepartment = document.getElementById("profileDepartment");
    const profileSkills = document.getElementById("profileSkills");

    if (profileName) profileName.textContent = student.name;
    if (profileEmail) profileEmail.textContent = student.email;
    if (profileUniversity) profileUniversity.textContent = student.university;
    if (profileDepartment) profileDepartment.textContent = student.department;

    if (profileSkills) {
        profileSkills.textContent = student.skills.join(", ");
    }

}


// ==========================================
// 4. RESUME UPLOAD AND TEXT EXTRACTION
// ==========================================

const resumeInput = document.getElementById("resume");
const uploadButton = document.getElementById("uploadBtn");

if (resumeInput && uploadButton) {

    const fileNameElement = document.getElementById("fileName");
    const uploadMessage = document.getElementById("uploadMessage");

    // Create resume preview area
    let resumePreview = document.getElementById("resumeTextPreview");

    if (!resumePreview) {

        resumePreview = document.createElement("pre");
        resumePreview.id = "resumeTextPreview";

        resumePreview.style.whiteSpace = "pre-wrap";
        resumePreview.style.maxHeight = "300px";
        resumePreview.style.overflowY = "auto";
        resumePreview.style.padding = "15px";
        resumePreview.style.marginTop = "15px";
        resumePreview.style.border = "1px solid #ccc";
        resumePreview.style.borderRadius = "8px";

        uploadButton.insertAdjacentElement("afterend", resumePreview);

    }


    // Show selected file name
    resumeInput.addEventListener("change", function() {

        const file = resumeInput.files[0];

        if (file) {

            if (fileNameElement) {
                fileNameElement.textContent = file.name;
            }

            resumePreview.textContent = "";

        }

    });


    // Upload and extract resume text
    uploadButton.addEventListener("click", async function() {

        const file = resumeInput.files[0];

        if (!file) {

            uploadMessage.textContent = "Please select a resume first.";
            uploadMessage.style.color = "red";

            return;

        }


        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (fileExtension !== "pdf" && fileExtension !== "docx") {

            uploadMessage.textContent = "Only PDF and DOCX files are allowed.";
            uploadMessage.style.color = "red";

            return;

        }


        uploadMessage.textContent = "Processing resume...";
        uploadMessage.style.color = "blue";


        try {

            const arrayBuffer = await file.arrayBuffer();

            let extractedText = "";


            // Extract PDF text
            if (fileExtension === "pdf") {

                if (typeof pdfjsLib === "undefined") {
                    throw new Error("PDF.js library not loaded.");
                }

                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

                const pdf = await pdfjsLib.getDocument({
                    data: new Uint8Array(arrayBuffer)
                }).promise;


                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

                    const page = await pdf.getPage(pageNumber);
                    const content = await page.getTextContent();

                    const pageText = content.items
                        .map(item => item.str)
                        .join(" ");

                    extractedText += pageText + "\n";

                }

            }


            // Extract DOCX text
            else if (fileExtension === "docx") {

                if (typeof mammoth === "undefined") {
                    throw new Error("Mammoth.js library not loaded.");
                }

                const result = await mammoth.extractRawText({
                    arrayBuffer: arrayBuffer
                });

                extractedText = result.value;

            }


            if (!extractedText.trim()) {
                throw new Error("No readable text found in this resume.");
            }


            // Save resume text
            localStorage.setItem("resumeText", extractedText);


            // ==================================
            // AUTOMATIC SKILL EXTRACTION
            // ==================================

            const skillDatabase = [
                "HTML",
                "CSS",
                "JavaScript",
                "React",
                "Node.js",
                "Express.js",
                "Python",
                "Java",
                "C",
                "C++",
                "PHP",
                "SQL",
                "MySQL",
                "MongoDB",
                "Django",
                "Flask",
                "Git",
                "GitHub",
                "Bootstrap",
                "Tailwind CSS",
                "Machine Learning",
                "Artificial Intelligence",
                "Data Science",
                "DSA",
                "Problem Solving"
            ];

            const resumeLower = extractedText.toLowerCase();

            const extractedSkills = skillDatabase.filter(function(skill) {

                const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

                const regex = new RegExp(
                    "(^|[^a-z0-9+#.])" + escapedSkill.toLowerCase() +
                    "($|[^a-z0-9+#.])",
                    "i"
                );

                return regex.test(resumeLower);

            });


            // Add extracted skills to student profile
            const currentStudent = JSON.parse(
                localStorage.getItem("studentData")
            );

            if (currentStudent) {

                const existingSkills = currentStudent.skills || [];

                const combinedSkills = [
                    ...new Set(
                        [...existingSkills, ...extractedSkills]
                            .map(skill => skill.trim().toLowerCase())
                    )
                ];

                currentStudent.skills = combinedSkills;

                localStorage.setItem(
                    "studentData",
                    JSON.stringify(currentStudent)
                );

            }


            // Show extracted text
            resumePreview.textContent = extractedText;

            uploadMessage.textContent =
                "Resume processed successfully! Skills extracted: " +
                extractedSkills.join(", ");

            uploadMessage.style.color = "green";

            console.log("Extracted Skills:", extractedSkills);

        }

        catch (error) {

            console.error("Resume Processing Error:", error);

            uploadMessage.textContent = error.message;
            uploadMessage.style.color = "red";

        }

    });

}


// ==========================================
// 5. PROFILE UPDATE FEATURE
// ==========================================

const updateForm = document.getElementById("updateForm");

if (updateForm) {

    const currentData = localStorage.getItem("studentData");

    if (currentData) {

        const currentStudent = JSON.parse(currentData);

        document.getElementById("updateName").value =
            currentStudent.name || "";

        document.getElementById("updateUniversity").value =
            currentStudent.university || "";

        document.getElementById("updateDepartment").value =
            currentStudent.department || "";

        document.getElementById("updateSkills").value =
            (currentStudent.skills || []).join(", ");

    }


    updateForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const existingStudent = JSON.parse(
            localStorage.getItem("studentData")
        );

        const updatedStudent = {

            name: document.getElementById("updateName").value,

            email: existingStudent.email,

            university: document.getElementById("updateUniversity").value,

            department: document.getElementById("updateDepartment").value,

            skills: document.getElementById("updateSkills").value
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== "")

        };


        // Save updated profile
        localStorage.setItem(
            "studentData",
            JSON.stringify(updatedStudent)
        );


        // Update profile information on the page
        const profileName = document.getElementById("profileName");
        const profileUniversity = document.getElementById("profileUniversity");
        const profileDepartment = document.getElementById("profileDepartment");
        const profileSkills = document.getElementById("profileSkills");

        if (profileName) {
            profileName.textContent = updatedStudent.name;
        }

        if (profileUniversity) {
            profileUniversity.textContent = updatedStudent.university;
        }

        if (profileDepartment) {
            profileDepartment.textContent = updatedStudent.department;
        }

        if (profileSkills) {
            profileSkills.textContent = updatedStudent.skills.join(", ");
        }


        const updateMessage = document.getElementById("updateMessage");

        if (updateMessage) {
            updateMessage.textContent = "Profile updated successfully!";
            updateMessage.style.color = "green";
        }

    });

}

 // ==========================================
 // 6. JOB AND INTERNSHIP DATA
 // ==========================================

const defaultJobs = [

    {
        id: 1,
        title: "Frontend Developer Intern",
        company: "ABC Technologies",
        type: "Internship",
        location: "Dhaka",
        description: "We are looking for a Frontend Developer Intern. The candidate will help build user-friendly websites and improve website design.",
        skills: ["HTML", "CSS", "JavaScript"]
    },

    {
        id: 2,
        title: "Python Developer",
        company: "Tech Solutions",
        type: "Full-time",
        location: "Dhaka",
        description: "We are looking for a Python Developer who can work with Python, Django and databases to develop web applications.",
        skills: ["Python", "Django", "SQL"]
    },

    {
        id: 3,
        title: "Web Development Intern",
        company: "Creative IT",
        type: "Internship",
        location: "Remote",
        description: "This internship is suitable for students interested in modern web development. You will work with frontend technologies and React.",
        skills: ["HTML", "CSS", "JavaScript", "React"]
    },

    {
        id: 4,
        title: "Software Engineer",
        company: "Digital World",
        type: "Full-time",
        location: "Dhaka",
        description: "We are looking for a Software Engineer with programming and problem-solving skills. The candidate should understand data structures and algorithms.",
        skills: ["C++", "Java", "DSA"]
    }

];


// Load jobs saved by Admin
let jobs = JSON.parse(
    localStorage.getItem("allJobs")
) || defaultJobs;


// Save initial jobs if no Admin data exists
if (!localStorage.getItem("allJobs")) {

    localStorage.setItem(
        "allJobs",
        JSON.stringify(jobs)
    );

}

// ==========================================
// 7. SKILL GAP ANALYSIS
// ==========================================

function analyzeSkillGap(studentSkills, jobSkills) {

    const student = studentSkills.map(skill =>
        skill.toLowerCase()
    );

    const matchedSkills = jobSkills.filter(skill =>
        student.includes(skill.toLowerCase())
    );

    const missingSkills = jobSkills.filter(skill =>
        !student.includes(skill.toLowerCase())
    );

    return {
        matchedSkills,
        missingSkills
    };

}


// ==========================================
// 8. JOB DETAILS MODAL
// ==========================================

function createJobDetailsModal() {

    // Do not create the modal more than once
    if (document.getElementById("jobDetailsModal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "jobDetailsModal";

    modal.innerHTML = `

        <div id="jobDetailsContent">

            <button id="closeJobDetails">&times;</button>

            <h2 id="detailsTitle"></h2>

            <p><strong>Company:</strong>
                <span id="detailsCompany"></span>
            </p>

            <p><strong>Job Type:</strong>
                <span id="detailsType"></span>
            </p>

            <p><strong>Location:</strong>
                <span id="detailsLocation"></span>
            </p>

            <h3>Job Description</h3>

            <p id="detailsDescription"></p>

            <h3>Required Skills</h3>

            <p id="detailsSkills"></p>

        </div>

    `;


    document.body.appendChild(modal);


    // Modal design
    const style = document.createElement("style");

    style.textContent = `

        #jobDetailsModal {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.65);
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
        }

        #jobDetailsContent {
            background: white;
            color: #222;
            width: 100%;
            max-width: 550px;
            padding: 30px;
            border-radius: 12px;
            position: relative;
            max-height: 85vh;
            overflow-y: auto;
        }

        #jobDetailsContent h2 {
            margin-top: 10px;
            color: #2563eb;
        }

        #jobDetailsContent h3 {
            margin-top: 20px;
        }

        #jobDetailsContent p {
            line-height: 1.6;
        }

        #closeJobDetails {
            position: absolute;
            top: 10px;
            right: 15px;
            border: none;
            background: none;
            font-size: 30px;
            cursor: pointer;
            color: #333;
        }

    `;

    document.head.appendChild(style);


    // Close modal button
    document.getElementById("closeJobDetails")
        .addEventListener("click", function() {

            modal.style.display = "none";

        });


    // Close modal by clicking outside
    modal.addEventListener("click", function(event) {

        if (event.target === modal) {
            modal.style.display = "none";
        }

    });

}


// ==========================================
// 9. DISPLAY JOB CARDS
// ==========================================

const jobsContainer = document.getElementById("jobsContainer");

if (jobsContainer) {

    function displayJobs(jobList) {

        jobsContainer.innerHTML = "";

        const noJobsMessage = document.getElementById("noJobsMessage");


        if (jobList.length === 0) {

            if (noJobsMessage) {
                noJobsMessage.textContent = "No jobs found!";
            }

            return;

        }


        if (noJobsMessage) {
            noJobsMessage.textContent = "";
        }


        // Get latest student information
        const latestStudentData = localStorage.getItem("studentData");

        const studentData = latestStudentData
            ? JSON.parse(latestStudentData)
            : null;


        // Get student skills
        const studentSkills = studentData
            ? (studentData.skills || []).map(skill =>
                skill.trim().toLowerCase()
            )
            : [];


        // Calculate matching scores
        const jobsWithScores = jobList.map(function(job) {

            const requiredSkills = job.skills.map(skill =>
                skill.trim().toLowerCase()
            );

            const matchedSkills = requiredSkills.filter(skill =>
                studentSkills.includes(skill)
            );

            const score = requiredSkills.length > 0
                ? (matchedSkills.length / requiredSkills.length) * 100
                : 0;

            return {
                ...job,
                matchedSkills: matchedSkills,
                matchScore: score
            };

        });


        // Sort jobs by matching score
        jobsWithScores.sort(function(a, b) {

            return b.matchScore - a.matchScore;

        });


        // Display job cards
        jobsWithScores.forEach(function(job) {

            const card = document.createElement("div");

            card.className = "job-card";


            const skillAnalysis = analyzeSkillGap(
                studentData ? studentData.skills || [] : [],
                job.skills
            );


            card.innerHTML = `

                <h3>${job.title}</h3>

                <p><strong>Company:</strong> ${job.company}</p>

                <p><strong>Type:</strong> ${job.type}</p>

                <p><strong>Location:</strong> ${job.location}</p>

                <p><strong>Required Skills:</strong>
                    ${job.skills.join(", ")}
                </p>

                <p><strong>Matched Skills:</strong>
                    ${job.matchedSkills.join(", ") || "None"}
                </p>

                <p><strong>Matching Score:</strong>
                    ${job.matchScore.toFixed(2)}%
                </p>

                <div class="skill-gap">

                    <p>
                        <strong>Missing Skills:</strong>
                        ${skillAnalysis.missingSkills.join(", ") || "None"}
                    </p>

                </div>

                <button class="applyBtn" data-id="${job.id}">
                    Apply Now
                </button>

                <button class="detailsBtn" data-id="${job.id}">
                    View Details
                </button>

            `;


            jobsContainer.appendChild(card);

        });


        // Show profile reminder
        if (!studentData && noJobsMessage) {

            noJobsMessage.textContent =
                "Create a student profile to see matching scores.";

        }

    }


    // ==========================================
    // 10. SHOW ALL JOBS FIRST
    // ==========================================

    displayJobs(jobs);


    // ==========================================
    // 11. SEARCH AND FILTER
    // ==========================================

    const searchInput = document.getElementById("searchInput");

    const jobType = document.getElementById("jobType");


    function filterJobs() {

        const searchText = searchInput
            ? searchInput.value.toLowerCase()
            : "";

        const selectedType = jobType
            ? jobType.value
            : "All";


        const filteredJobs = jobs.filter(function(job) {

            const searchableText = (

                job.title + " " +
                job.company + " " +
                job.skills.join(" ") + " " +
                job.location

            ).toLowerCase();


            const matchesSearch =
                searchableText.includes(searchText);

            const matchesType =
                selectedType === "All" || job.type === selectedType;


            return matchesSearch && matchesType;

        });


        displayJobs(filteredJobs);

    }


    if (searchInput) {
        searchInput.addEventListener("input", filterJobs);
    }

    if (jobType) {
        jobType.addEventListener("change", filterJobs);
    }


    // ==========================================
    // 12. APPLY NOW AND VIEW DETAILS BUTTONS
    // ==========================================

    jobsContainer.addEventListener("click", function(event) {


        // APPLY NOW BUTTON
        const applyButton = event.target.closest(".applyBtn");

        if (applyButton) {

            const jobId = Number(applyButton.dataset.id);

            const selectedJob = jobs.find(function(job) {
                return job.id === jobId;
            });


            if (selectedJob) {

                alert("You selected: " + selectedJob.title);

            }

            return;

        }


        // VIEW DETAILS BUTTON
        const detailsButton = event.target.closest(".detailsBtn");

        if (detailsButton) {

            const jobId = Number(detailsButton.dataset.id);

            const selectedJob = jobs.find(function(job) {
                return job.id === jobId;
            });


            if (selectedJob) {

                createJobDetailsModal();

                document.getElementById("detailsTitle").textContent =
                    selectedJob.title;

                document.getElementById("detailsCompany").textContent =
                    selectedJob.company;

                document.getElementById("detailsType").textContent =
                    selectedJob.type;

                document.getElementById("detailsLocation").textContent =
                    selectedJob.location;

                document.getElementById("detailsDescription").textContent =
                    selectedJob.description;

                document.getElementById("detailsSkills").textContent =
                    selectedJob.skills.join(", ");


                document.getElementById("jobDetailsModal").style.display =
                    "flex";

            }

        }

    });

}
// ==========================================
// 13. JOB APPLICATION FORM
// ==========================================

// Create Application Modal
function createApplicationModal() {

    if (document.getElementById("applicationModal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "applicationModal";

    modal.innerHTML = `

        <div id="applicationContent">

            <button type="button" id="closeApplication">
                &times;
            </button>

            <h2>Job Application Form</h2>

            <form id="applicationForm">

                <label>Student Name</label>
                <input type="text" id="applicantName" required>

                <label>Email Address</label>
                <input type="email" id="applicantEmail" required>

                <label>Applying For</label>
                <input type="text" id="applicationJob" readonly>

                <label>Company</label>
                <input type="text" id="applicationCompany" readonly>

                <label>Cover Letter</label>
                <textarea
                    id="coverLetter"
                    rows="5"
                    placeholder="Write why you are suitable for this job..."
                    required
                ></textarea>

                <button type="submit">
                    Submit Application
                </button>

            </form>

            <p id="applicationMessage"></p>

        </div>

    `;

    document.body.appendChild(modal);


    // Application form design
    const style = document.createElement("style");

    style.textContent = `

        #applicationModal {
            display: none;
            position: fixed;
            z-index: 10000;
            inset: 0;
            background: rgba(0,0,0,0.65);
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        #applicationContent {
            background: white;
            color: #222;
            width: 100%;
            max-width: 500px;
            padding: 30px;
            border-radius: 12px;
            position: relative;
            max-height: 85vh;
            overflow-y: auto;
        }

        #applicationContent h2 {
            margin-bottom: 20px;
            color: #2563eb;
        }

        #applicationContent label {
            display: block;
            margin-top: 12px;
            margin-bottom: 6px;
            font-weight: bold;
        }

        #applicationContent input,
        #applicationContent textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 15px;
        }

        #applicationContent textarea {
            resize: vertical;
        }

        #applicationContent form button {
            margin-top: 18px;
            padding: 12px 20px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }

        #closeApplication {
            position: absolute;
            top: 10px;
            right: 15px;
            border: none;
            background: none;
            font-size: 28px;
            cursor: pointer;
        }

        #applicationMessage {
            margin-top: 15px;
            font-weight: bold;
        }

    `;

    document.head.appendChild(style);


    // Close button
    document.getElementById("closeApplication")
        .addEventListener("click", function() {

            modal.style.display = "none";

        });


    // Close by clicking outside
    modal.addEventListener("click", function(event) {

        if (event.target === modal) {
            modal.style.display = "none";
        }

    });


    // Submit application
    document.getElementById("applicationForm")
        .addEventListener("submit", function(event) {

            event.preventDefault();

            const application = {

                id: Date.now(),

                studentName:
                    document.getElementById("applicantName").value,

                email:
                    document.getElementById("applicantEmail").value,

                jobTitle:
                    document.getElementById("applicationJob").value,

                company:
                    document.getElementById("applicationCompany").value,

                coverLetter:
                    document.getElementById("coverLetter").value,

                status: "Pending",

                appliedAt: new Date().toLocaleString()

            };


            // Get previous applications
            const previousApplications = JSON.parse(
                localStorage.getItem("jobApplications") || "[]"
            );


            // Save new application
            previousApplications.push(application);

            localStorage.setItem(
                "jobApplications",
                JSON.stringify(previousApplications)
            );


            document.getElementById("applicationMessage").textContent =
                "Application submitted successfully!";

            document.getElementById("applicationMessage").style.color =
                "green";


            document.getElementById("applicationForm").reset();

        });

}


// ==========================================
// 14. HANDLE APPLY NOW BUTTON
// ==========================================

// Capture the click before the old Apply Now handler.
document.addEventListener("click", function(event) {

    const applyButton = event.target.closest(".applyBtn");

    if (!applyButton) {
        return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();


    const jobId = Number(applyButton.dataset.id);

    const selectedJob = jobs.find(function(job) {
        return job.id === jobId;
    });


    if (!selectedJob) {
        return;
    }


    // Get student profile
    const studentData = JSON.parse(
        localStorage.getItem("studentData") || "null"
    );


    if (!studentData) {

        alert("Please create a student profile first.");

        return;

    }


    // Create and open application form
    createApplicationModal();

    document.getElementById("applicantName").value =
        studentData.name || "";

    document.getElementById("applicantEmail").value =
        studentData.email || "";

    document.getElementById("applicationJob").value =
        selectedJob.title;

    document.getElementById("applicationCompany").value =
        selectedJob.company;


    document.getElementById("applicationMessage").textContent = "";

    document.getElementById("applicationModal").style.display = "flex";

}, true);