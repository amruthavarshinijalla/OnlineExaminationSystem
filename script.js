class ExamManager {
    static instance = null;

    constructor() {
        if (ExamManager.instance) {
            return ExamManager.instance;
        }

        this.exams = this.loadExams();
        ExamManager.instance = this;
    }

    static getInstance() {
        if (!ExamManager.instance) {
            ExamManager.instance = new ExamManager();
        }

        return ExamManager.instance;
    }

    loadExams() {
        try {
            const saved = localStorage.getItem("examinationSchedules");
            const parsed = saved ? JSON.parse(saved) : [];

            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    saveExams() {
        try {
            localStorage.setItem(
                "examinationSchedules",
                JSON.stringify(this.exams)
            );
        } catch (error) {
            alert("Unable to save data in this browser.");
        }
    }

    addExam(subject, date, time, details) {
        const exam = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            subject,
            date,
            time,
            details
        };

        this.exams.push(exam);
        this.saveExams();

        return exam;
    }

    getExams() {
        return [...this.exams];
    }

    deleteExam(id) {
        this.exams = this.exams.filter(exam => exam.id !== id);
        this.saveExams();
    }

    clearExams() {
        this.exams = [];
        this.saveExams();
    }
}

// Access the Singleton instance
const manager = ExamManager.getInstance();

// HTML elements
const examForm = document.getElementById("examForm");
const examList = document.getElementById("examList");
const examCount = document.getElementById("examCount");
const verifyBtn = document.getElementById("verifyBtn");
const singletonStatus = document.getElementById("singletonStatus");
const clearBtn = document.getElementById("clearBtn");

// Format a date for display
function formatDate(dateString) {
    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Display examinations
function displayExams() {
    const exams = manager.getExams();

    examCount.textContent = `Total: ${exams.length}`;
    examList.replaceChildren();

    if (exams.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No examinations scheduled yet.";
        examList.appendChild(message);
        return;
    }

    exams.forEach(exam => {
        const item = document.createElement("article");
        item.className = "exam-item";

        const title = document.createElement("h3");
        title.textContent = exam.subject;

        const date = document.createElement("p");
        date.textContent = `Date: ${formatDate(exam.date)}`;

        const time = document.createElement("p");
        time.textContent = `Time: ${exam.time}`;

        const details = document.createElement("p");
        details.textContent = `Details: ${exam.details}`;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-one-btn";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete Examination";

        deleteButton.addEventListener("click", () => {
            manager.deleteExam(exam.id);
            displayExams();
        });

        item.append(title, date, time, details, deleteButton);
        examList.appendChild(item);
    });
}

// Add examination
examForm.addEventListener("submit", event => {
    event.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const details = document.getElementById("details").value.trim();

    if (!subject || !date || !time || !details) {
        alert("Please fill in all fields.");
        return;
    }

    manager.addExam(subject, date, time, details);

    examForm.reset();
    displayExams();

    alert("Examination added successfully!");
});

// Verify Singleton
verifyBtn.addEventListener("click", () => {
    const anotherReference = ExamManager.getInstance();

    if (manager === anotherReference) {
        singletonStatus.textContent =
            "Success! Both references point to the same ExamManager instance.";

        singletonStatus.style.background = "#dcfce7";
        singletonStatus.style.color = "#166534";
    } else {
        singletonStatus.textContent = "Different instances detected.";

        singletonStatus.style.background = "#fee2e2";
        singletonStatus.style.color = "#991b1b";
    }
});

// Clear all examinations
clearBtn.addEventListener("click", () => {
    if (manager.getExams().length === 0) {
        alert("There are no examinations to clear.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete all examinations?"
    );

    if (confirmed) {
        manager.clearExams();
        displayExams();
    }
});

// Set today's date as the earliest selectable date
document.getElementById("date").min =
    new Date().toLocaleDateString("en-CA");

// Load saved examinations on startup
displayExams();
