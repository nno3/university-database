const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE Department (
    Department_name VARCHAR(50) PRIMARY KEY,
    Building VARCHAR(50),
    Budget DECIMAL(16, 2)
);
CREATE TABLE Instructor (
    Instructor_ID INT PRIMARY KEY,
    Instructor_name VARCHAR(100),
    Salary DECIMAL(16, 2),
    Department_name VARCHAR(50),
    FOREIGN KEY (Department_name) REFERENCES Department(Department_name)
);
CREATE TABLE Student (
    Student_ID INT PRIMARY KEY,
    Student_name VARCHAR(100),
    Total_credits INT,
    Department_name VARCHAR(50),
    Instructor_ID INT,
    FOREIGN KEY (Instructor_ID) REFERENCES Instructor(Instructor_ID),
    FOREIGN KEY (Department_name) REFERENCES Department(Department_name)
);
CREATE TABLE Course (
    Course_ID INT,
    Prerequisites_ID INT,
    Title VARCHAR(100),
    Credits INT,
    Department_name VARCHAR(50),
    PRIMARY KEY (Course_ID, Prerequisites_ID),
    UNIQUE (Course_ID),
    FOREIGN KEY (Department_name) REFERENCES Department(Department_name)
);
CREATE TABLE TimeSlot (
    TimeSlot_ID INT PRIMARY KEY,
    Start_time TEXT,
    End_time TEXT,
    Day_of_week VARCHAR(20)
);
CREATE TABLE Classroom (
    Building VARCHAR(50),
    Room_number VARCHAR(20),
    Capacity INT,
    PRIMARY KEY (Building, Room_number)
);
CREATE TABLE Section (
    Course_ID INT,
    Section_ID INT,
    Semester VARCHAR(30),
    Academic_year INT,
    Building VARCHAR(50),
    Room_number VARCHAR(20),
    TimeSlot_ID INT,
    PRIMARY KEY (Course_ID, Section_ID),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID),
    FOREIGN KEY (TimeSlot_ID) REFERENCES TimeSlot(TimeSlot_ID),
    FOREIGN KEY (Building, Room_number) REFERENCES Classroom(Building, Room_number)
);
CREATE TABLE Prerequisite_Course (
    Course_ID INT,
    Prerequisites_ID INT,
    PRIMARY KEY (Course_ID, Prerequisites_ID),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID),
    FOREIGN KEY (Prerequisites_ID) REFERENCES Course(Course_ID)
);
CREATE TABLE Advisory (
    Student_ID INT,
    Instructor_ID INT,
    PRIMARY KEY (Student_ID, Instructor_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID),
    FOREIGN KEY (Instructor_ID) REFERENCES Instructor(Instructor_ID)
);
CREATE TABLE Teaches (
    Instructor_ID INT,
    Course_ID INT,
    PRIMARY KEY (Instructor_ID, Course_ID),
    FOREIGN KEY (Instructor_ID) REFERENCES Instructor(Instructor_ID),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID)
);
`;

const SAMPLE = `
INSERT INTO Department VALUES
('Computer Science', 'Ken Edwards', 500000),
('Mathematics', 'Bennett', 300000),
('Physics', 'Physics', 250000);

INSERT INTO Instructor VALUES
(1, 'Ada Shah', 95000, 'Computer Science'),
(2, 'Ben Cole', 120000, 'Computer Science'),
(3, 'Cara Nguyen', 88000, 'Mathematics'),
(4, 'Dan Okonkwo', 97000, 'Physics');

INSERT INTO Student VALUES
(101, 'Maya Chen', 60, 'Computer Science', 1),
(102, 'Omar Hassan', 45, 'Computer Science', 1),
(103, 'Lina Brooks', 30, 'Computer Science', 2),
(104, 'Sam Iqbal', 50, 'Mathematics', 3);

INSERT INTO Course VALUES
(101, 101, 'Programming', 15, 'Computer Science'),
(102, 101, 'Databases', 15, 'Computer Science'),
(201, 201, 'Calculus', 20, 'Mathematics'),
(301, 301, 'Mechanics', 15, 'Physics');

INSERT INTO TimeSlot VALUES
(1, '09:00', '10:00', 'Monday'),
(2, '11:00', '12:00', 'Wednesday');

INSERT INTO Classroom VALUES
('Ken Edwards', 'KE101', 80),
('Bennett', 'BEN2', 40),
('Physics', 'PHY1', 60);

INSERT INTO Section VALUES
(102, 1, 'Fall', 2009, 'Ken Edwards', 'KE101', 1),
(101, 2, 'Spring', 2009, 'Ken Edwards', 'KE101', 1),
(101, 3, 'Spring', 2010, 'Ken Edwards', 'KE101', 2),
(201, 4, 'Spring', 2010, 'Bennett', 'BEN2', 2),
(301, 5, 'Fall', 2009, 'Physics', 'PHY1', 1);

INSERT INTO Prerequisite_Course VALUES (102, 101);
INSERT INTO Advisory VALUES (101, 1), (102, 1), (103, 2), (104, 3);
INSERT INTO Teaches VALUES (1, 102), (1, 101), (2, 101), (3, 201), (4, 301);
`;

const QUESTIONS = [
    {
        title: "Instructors and the course IDs they teach",
        sql: `SELECT i.Instructor_name, t.Course_ID
FROM Instructor i
JOIN Teaches t ON i.Instructor_ID = t.Instructor_ID;`
    },
    {
        title: "Instructor names and course titles, using NATURAL JOIN",
        sql: `SELECT i.Instructor_name, c.Title
FROM Instructor i
NATURAL JOIN Teaches t
NATURAL JOIN Course c;`
    },
    {
        title: "Instructors paid between 90,000 and 100,000",
        sql: `SELECT instructor_name
FROM Instructor
WHERE salary BETWEEN 90000 AND 100000;`
    },
    {
        title: "Courses taught in Fall 2009 or Spring 2010",
        sql: `SELECT S.Course_ID, C.Title
FROM Section S
JOIN Course C ON S.Course_ID = C.Course_ID
WHERE (S.Semester = 'Fall' AND S.Academic_year = 2009)
   OR (S.Semester = 'Spring' AND S.Academic_year = 2010);`
    },
    {
        title: "How many instructors in each department teach in Spring 2010",
        sql: `SELECT
    i.Department_name,
    COUNT(DISTINCT i.Instructor_ID) AS num_instructors
FROM Instructor i
JOIN Course c ON i.Department_name = c.Department_name
JOIN Section s ON c.Course_ID = s.Course_ID
WHERE s.Semester = 'Spring'
  AND s.Academic_year = 2010
GROUP BY i.Department_name;`
    },
    {
        title: "Average student credits for 2009 sections with at least two students",
        sql: `SELECT
    Section.Section_ID,
    AVG(Student.Total_credits) AS average_total_credits
FROM Student
NATURAL JOIN Department
NATURAL JOIN Course
NATURAL JOIN Section
WHERE Section.Academic_year = 2009
GROUP BY Section.Section_ID
HAVING COUNT(Student.Student_ID) >= 2;`
    },
    {
        title: "Courses taught in Fall 2009 but not in Spring 2010",
        sql: `SELECT Course_ID
FROM Section
WHERE Semester = 'Fall'
  AND Academic_year = 2009
  AND Course_ID NOT IN (
      SELECT Course_ID
      FROM Section
      WHERE Semester = 'Spring'
        AND Academic_year = 2010
  );`
    },
    {
        title: "Department with the highest average salary",
        sql: `SELECT Department_name, AVG(Salary) AS avg_salary
FROM Instructor
GROUP BY Department_name
HAVING AVG(Salary) = (
    SELECT MAX(avg_salary)
    FROM (
        SELECT AVG(Salary) AS avg_salary
        FROM Instructor
        GROUP BY Department_name
    )
);`
    },
    {
        title: "Set each student's total credits from the courses on offer",
        sql: `UPDATE Student
SET Total_credits = (
    SELECT SUM(Credits)
    FROM Course
    JOIN Section ON Course.Course_ID = Section.Course_ID
);`
    },
    {
        title: "Computer Science students and Spring 2009 sections",
        sql: `SELECT
    s.Student_ID,
    s.Student_name,
    c.Course_ID,
    c.Title,
    sec.Section_ID
FROM Student s
LEFT JOIN Course c ON s.Department_name = c.Department_name
LEFT JOIN Section sec ON c.Course_ID = sec.Course_ID
    AND sec.Semester = 'Spring'
    AND sec.Academic_year = 2009
WHERE s.Department_name = 'Computer Science';`
    }
];

const statusEl = document.getElementById("status");
const questionsEl = document.getElementById("questions");
const resultEl = document.getElementById("result");
const resultTitle = document.getElementById("result-title");
let SQL = null;
let db = null;

document.getElementById("reset").addEventListener("click", () => {
    rebuild();
    statusEl.textContent = "Sample university loaded.";
    statusEl.className = "";
    run(0);
});

initSqlJs({ locateFile: () => "sql-wasm.wasm" }).then((loaded) => {
    SQL = loaded;
    rebuild();
    statusEl.textContent = "Sample university loaded.";
    renderQuestions();
    run(0);
}).catch((error) => {
    statusEl.textContent = "The database could not be loaded.";
    statusEl.className = "error";
    console.error(error);
});

function rebuild() {
    if (db) db.close();
    db = new SQL.Database();
    db.run(SCHEMA);
    db.run(SAMPLE);
}

function renderQuestions() {
    questionsEl.innerHTML = QUESTIONS.map((question, index) => `
        <article class="question" id="q-${index}">
            <p>${escapeHtml(question.title)}</p>
            <button type="button" data-run="${index}">Run query</button>
            <pre>${escapeHtml(question.sql.trim())}</pre>
        </article>
    `).join("");
    questionsEl.querySelectorAll("[data-run]").forEach((button) => {
        button.addEventListener("click", () => run(Number(button.dataset.run)));
    });
}

function run(index) {
    const question = QUESTIONS[index];
    document.querySelectorAll(".question").forEach((card) => card.classList.remove("active"));
    const card = document.getElementById("q-" + index);
    if (card) card.classList.add("active");
    resultTitle.textContent = question.title;
    try {
        const output = db.exec(question.sql);
        if (!output.length) {
            resultEl.innerHTML = `<p class="empty">The statement ran. Reload the sample to restore the original credit totals.</p>`;
            return;
        }
        const table = output[0];
        const head = table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
        const body = table.values.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
        resultEl.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    } catch (error) {
        resultEl.innerHTML = `<p class="empty">${escapeHtml(error.message)}</p>`;
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
