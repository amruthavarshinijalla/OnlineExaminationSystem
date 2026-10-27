"use strict";

// ========================================
// 1. Base Examination Product
// ========================================

class Exam {
    constructor(subject, date, time, details) {
        this.id = Date.now().toString()
            + Math.random().toString(16).slice(2);

        this.subject = subject;
        this.date = date;
        this.time = time;
        this.details = details;
    }

    getExamType() {
        return "General Examination";
    }
}


// ========================================
// 2. Concrete Examination Products
// ========================================

class MCQExam extends Exam {
    getExamType() {
        return "MCQ Examination";
    }
}

class ProgrammingExam extends Exam {
    getExamType() {
        return "Programming Examination";
    }
}

class WrittenExam extends Exam {
    getExamType() {
        return "Written Examination";
    }
}


// ========================================
// 3. Base Creator
// ========================================

class ExamCreator {
    createExam(subject, date, time, details) {
        throw new Error(
            "Subclasses must implement createExam()."
        );
    }
}


// ========================================
// 4. Concrete Creators
// ========================================

class MCQExamCreator extends ExamCreator {
    createExam(subject, date, time, details) {
        return new MCQExam(subject, date, time, details);
    }
}

class ProgrammingExamCreator extends ExamCreator {
    createExam(subject, date, time, details) {
        return new ProgrammingExam(
            subject, date, time, details
        );
    }
}

class WrittenExamCreator extends ExamCreator {
    createExam(subject, date, time, details) {
        return new WrittenExam(
            subject, date, time, details
        );
    }
}


// ========================================
// 5. Factory Method Registry
// ========================================

class ExamFactory {
    static creators = {
        MCQ: new MCQExamCreator(),
        Programming: new ProgrammingExamCreator(),
        Written: new WrittenExamCreator()
    };

    static createExam(type, subject, date, time, details) {
        const creator = ExamFactory.creators[type];

        if (!creator) {
            throw new Error("Invalid examination type.");
        }

        // The selected creator decides which object to create.
        return creator.createExam(subject, date, time, details);
    }

    static restoreExam(data) {
        const exam = ExamFactory.createExam(
            data.type,
            data.subject,
            data.date,
            data.time,
            data.details
        );

        exam.id = data.id;
        return exam;
    }
}


// ========================================
// 6. Examination Manager
// ========================================

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
            const saved = localStorage.getItem(
                "examinationSchedules"
            );

            const data = saved ? JSON.parse(saved) : [];

            if (!Array.isArray(data)) {
                return [];
            }

            return data.map(item => {
                return ExamFactory.restoreExam(item);
            });
        } catch (error) {
            console.error("Could not load examinations:", error);
            return [];
        }
    }

    saveExams() {
        try {
            localStorage.setItem(
                "examinationSchedules",
                JSON.stringify(
                    this.exams.map(exam => ({
                        id: exam.id,
                        type: exam.type,
                        subject: exam.subject,
                        date: exam.date,
                        time: exam.time,
                        details: exam.details
                    }))
                )
            );

            return true;
        } catch (error) {
            console.error("Could not save examinations:", error);
            alert("Unable to save data in this browser.");
            return false;
        }
    }

    addExam(type, subject, date, time, details) {
        const exam = ExamFactory.createExam(
            type, subject, date, time, details
        );

        // Store the type so the factory can restore the right class.
        exam.type = type;

        this.exams.push(exam);

        if (!this.saveExams()) {
            this.exams.pop();
            return null;
        }

        return exam;
    }

    getExams() {
        return [...this.exams];
    }

    deleteExam(id) {
        const previousExams = this.exams;

        this.exams = this.exams.filter(exam => exam.id !== id);

        if (!this.saveExams()) {
            this.exams = previousExams;
            return false;
        }

        return true;
    }

    clearExams() {
        const previousExams = this.exams;

        this.exams = [];

        if (!this.saveExams()) {
            this.exams = previousExams;
            return false;
        }

        return true;
    }
}


// ========================================
// 7. Connect JavaScript to the Website
// ========================================

const manager = ExamManager.getInstance();

const examForm = document.getElementById("examForm");
const examList = document.getElementById("examList");
const examCount = document.getElementById("examCount");

const verifyBtn = document.getElementById("verifyBtn");
const factoryStatus = document.getElementById("factoryStatus");
const clearBtn = document.getElementById("clearBtn");


// ========================================
// 8. Display Examination Schedule
// ========================================

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

        const type = document.createElement("p");
        type.textContent = `Type: ${exam.getExamType()}`;

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
            if (manager.deleteExam(exam.id)) {
                displayExams();
            }
        });

        item.append(
            title,
            type,
            date,
            time,
            details,
            deleteButton
        );

        examList.appendChild(item);
    });
}


// ========================================
// 9. Format Date
// ========================================

function formatDate(dateString) {
    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


// ========================================
// 10. Add Examination
// ========================================

examForm.addEventListener("submit", event => {
    event.preventDefault();

    const type = document.getElementById("examType").value;
    const subject = document.getElementById("subject").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const details = document.getElementById("details").value.trim();

    if (!type || !subject || !date || !time || !details) {
        alert("Please fill in all fields.");
        return;
    }

    const exam = manager.addExam(
        type, subject, date, time, details
    );

    if (!exam) {
        return;
    }

    examForm.reset();
    displayExams();

    alert(`${exam.getExamType()} created successfully!`);
});


// ========================================
// 11. Verify Factory Method
// ========================================

verifyBtn.addEventListener("click", () => {
    const testExam = ExamFactory.createExam(
        "Programming",
        "Java",
        "2026-11-15",
        "10:00",
        "Factory verification test"
    );

    if (testExam instanceof ProgrammingExam) {
        factoryStatus.textContent =
            "Success! ExamFactory created a ProgrammingExam object.";

        factoryStatus.style.background = "#dcfce7";
        factoryStatus.style.color = "#166534";
    } else {
        factoryStatus.textContent =
            "Factory verification failed.";

        factoryStatus.style.background = "#fee2e2";
        factoryStatus.style.color = "#991b1b";
    }
});


// ========================================
// 12. Clear All Examinations
// ========================================

clearBtn.addEventListener("click", () => {
    if (manager.getExams().length === 0) {
        alert("There are no examinations to clear.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete all examinations?"
    );

    if (confirmed && manager.clearExams()) {
        displayExams();
    }
});


// ========================================
// 13. Set Minimum Examination Date
// ========================================

const dateInput = document.getElementById("date");

const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.min = localToday;


// ========================================
// 14. Load Saved Examinations
// ========================================

displayExams();
