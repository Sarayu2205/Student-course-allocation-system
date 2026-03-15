from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.course import Course
import re

chat_bp = Blueprint("chat", __name__)

KB = {
    "CS101": {"topics": ["Variables & Data Types","Control Flow","Functions & Recursion","Lists/Tuples/Dicts","File I/O","OOP basics","Error Handling"],"skills":"Python, problem-solving","career":"Foundation for all CS. Essential for software dev, data science.","difficulty":"Beginner","tips":"Practice daily on HackerRank or LeetCode.","projects":"Calculator, To-do list, Tic-Tac-Toe"},
    "CS201": {"topics": ["Arrays & Linked Lists","Stacks & Queues","Trees (BST, AVL)","Graphs (BFS, DFS)","Sorting Algorithms","Hashing","Dynamic Programming"],"skills":"Algorithm design, Big-O analysis","career":"Core for software engineering interviews.","difficulty":"Intermediate","tips":"Visualize structures. Solve LeetCode problems.","projects":"Library system, Graph pathfinder, Expression evaluator"},
    "CS301": {"topics": ["SQL & Relational Model","ER Diagrams","Normalization","Transactions & ACID","Indexing","NoSQL Databases"],"skills":"SQL, database design, data modeling","career":"Essential for backend dev, data engineering.","difficulty":"Intermediate","tips":"Practice SQL on SQLZoo. Design real schemas.","projects":"Student DB, E-commerce DB, Hospital records"},
    "CS302": {"topics": ["HTML5 & CSS3","JavaScript & ES6+","React.js","Node.js & Express","REST APIs","JWT Auth","Deployment"],"skills":"Frontend & backend, API design","career":"High demand. Full-stack developer roles.","difficulty":"Intermediate","tips":"Build real projects. Learn Git/GitHub.","projects":"Portfolio, Blog, E-commerce, Chat app"},
    "CS401": {"topics": ["Linear & Logistic Regression","Decision Trees","Random Forests","SVM","Neural Networks","Clustering (K-Means)","PCA","Model Evaluation","NLP basics","Scikit-learn/TensorFlow"],"skills":"Python, statistics, model building","career":"AI/ML Engineer, Data Scientist. Highest-paying field.","difficulty":"Advanced","tips":"Strong math needed. Use Kaggle for practice.","projects":"Price prediction, Image classifier, Sentiment analysis"},
    "CS402": {"topics": ["SDLC (Agile, Scrum)","Requirements Engineering","UML Diagrams","Design Patterns","Unit Testing","Git & CI/CD"],"skills":"Team collaboration, system design, testing","career":"Essential for any software role. Leads to tech lead.","difficulty":"Intermediate","tips":"Work in teams. Contribute to open-source.","projects":"Team SDLC project, CI/CD pipeline, Open-source contribution"},
    "CS403": {"topics": ["OSI & TCP/IP Models","IP Addressing","Routing Protocols","TCP vs UDP","DNS/HTTP/HTTPS","Network Security","Socket Programming"],"skills":"Network config, protocol analysis, security","career":"Network engineer, cloud architect, DevOps.","difficulty":"Intermediate","tips":"Use Wireshark. Practice with Cisco Packet Tracer.","projects":"Chat server, Network scanner, HTTP server"},
    "CS404": {"topics": ["Process Scheduling","Memory Management","Virtual Memory","File Systems","Deadlocks","Semaphores","IPC","Linux internals"],"skills":"C/C++, concurrency, memory management","career":"Systems programmer, kernel developer, cloud infra.","difficulty":"Advanced","tips":"Learn C. Use Linux. Read Silberschatz OS book.","projects":"Shell, Memory allocator, Thread scheduler"},
}

def bot_reply(message, courses):
    msg = message.lower().strip()
    cmap = {c["code"].lower(): c for c in courses}
    nmap = {c["name"].lower(): c for c in courses}

    if re.search(r"\b(hi|hello|hey|hii)\b", msg):
        return "Hey! I am **CourseBot** 🎓\n\nAsk me about:\n- Course topics and syllabus\n- Career paths and skills\n- Study tips and project ideas\n- Prerequisites and difficulty\n\nTry: *What topics are in Machine Learning?*"

    if re.search(r"\b(all courses|list courses|available courses|show courses|what courses)\b", msg):
        lines = ["- **" + c["code"] + "** - " + c["name"] + " (" + str(c["credits"]) + " cr)" for c in courses]
        return "**Available Courses:**\n\n" + "\n".join(lines) + "\n\nAsk me about any course!"

    matched = None
    kb = None
    for code, c in cmap.items():
        if code in msg or c["name"].lower() in msg:
            matched = c; kb = KB.get(c["code"].upper()); break
    if not matched:
        for name, c in nmap.items():
            words = [w for w in name.split() if len(w) > 3]
            if any(w in msg for w in words):
                matched = c; kb = KB.get(c["code"].upper()); break

    if matched and kb:
        n, code = matched["name"], matched["code"]
        if re.search(r"\b(topic|syllabus|content|cover|teach|learn|what is in|what are)\b", msg):
            t = "\n".join([str(i+1) + ". " + x for i, x in enumerate(kb["topics"])])
            return "**" + n + " (" + code + ") - Topics:**\n\n" + t + "\n\n**Skills:** " + kb["skills"]
        if re.search(r"\b(career|job|scope|future|opportunity|role)\b", msg):
            return "**Career Scope - " + n + ":**\n\n" + kb["career"] + "\n\n**Skills:** " + kb["skills"]
        if re.search(r"\b(project|build|make|create|assignment|practical)\b", msg):
            return "**Project Ideas - " + n + ":**\n\n" + kb["projects"] + "\n\n**Tip:** " + kb["tips"]
        if re.search(r"\b(tip|advice|study|prepare|how to|suggestion)\b", msg):
            return "**Study Tips - " + n + ":**\n\n" + kb["tips"] + "\n\n**Key Topics:** " + ", ".join(kb["topics"][:4])
        if re.search(r"\b(difficult|hard|easy|level|tough|beginner|advanced)\b", msg):
            pre = matched.get("prerequisite_name") or "None"
            return "**" + n + " - Difficulty:** " + kb["difficulty"] + "\n\n" + kb["tips"] + "\n\n**Prerequisite:** " + pre
        if re.search(r"\b(prerequisite|prereq|require|before|need)\b", msg):
            pre = matched.get("prerequisite_name") or "None"
            return "**Prerequisites for " + n + ":**\n\nRequired: **" + pre + "**\nDifficulty: " + kb["difficulty"] + "\nCredits: " + str(matched["credits"])
        pre = matched.get("prerequisite_name") or "None"
        return ("**" + n + " (" + code + ")**\n\n"
                "Department: " + matched["department"] + "\n"
                "Time: " + (matched.get("time_slot") or "TBD") + "\n"
                "Credits: " + str(matched["credits"]) + " | Difficulty: " + kb["difficulty"] + "\n"
                "Prerequisite: " + pre + " | Seats: " + str(matched["capacity"]) + "\n\n"
                "**Topics preview:** " + ", ".join(kb["topics"][:3]) + "...\n\n"
                "Ask me about topics, career, projects, or tips!")

    if re.search(r"\b(machine learning|ml|artificial intelligence)\b", msg):
        k = KB.get("CS401", {})
        return "**Machine Learning (CS401)**\n\nTopics: " + ", ".join(k.get("topics",[])[:5]) + "\n\nCareer: " + k.get("career","")
    if re.search(r"\b(web|frontend|backend|fullstack)\b", msg):
        k = KB.get("CS302", {})
        return "**Web Development (CS302)**\n\nTopics: " + ", ".join(k.get("topics",[])[:5]) + "\n\n" + k.get("career","")
    if re.search(r"\b(database|sql)\b", msg):
        k = KB.get("CS301", {})
        return "**Database Systems (CS301)**\n\nTopics: " + ", ".join(k.get("topics",[])[:5]) + "\n\n" + k.get("tips","")

    if re.search(r"\b(recommend|suggest|which course|best course|should i take)\b", msg):
        if re.search(r"\b(beginner|start|new|first)\b", msg):
            return "**Best courses to start:**\n\n1. **CS101** - Intro to Programming (Beginner)\n2. **CS302** - Web Development\n3. **CS301** - Database Systems\n\nStart with CS101!"
        if re.search(r"\b(data science|data|analytics)\b", msg):
            return "**Data Science path:**\n\nCS101 -> CS201 -> CS301 -> **CS401 (ML)** ⭐\n\nCS401 is the core course for data science!"
        if re.search(r"\b(software|developer|engineer)\b", msg):
            return "**Software Engineering path:**\n\nCS101 -> CS201 -> CS302 -> **CS402** ⭐\n\nCS402 teaches real-world dev practices!"
        return "Tell me your goal!\n\nExamples:\n- *Recommend for data science*\n- *Best course for beginners*\n- *Courses for web development*"

    if re.search(r"\b(credit|credits)\b", msg):
        lines = ["- **" + c["code"] + "** " + c["name"] + ": " + str(c["credits"]) + " credits" for c in courses]
        return "**Course Credits:**\n\n" + "\n".join(lines)
    if re.search(r"\b(schedule|time|slot|timing|when)\b", msg):
        lines = ["- **" + c["code"] + "** " + c["name"] + ": " + (c.get("time_slot") or "TBD") for c in courses]
        return "**Class Schedule:**\n\n" + "\n".join(lines)
    if re.search(r"\b(help|what can you|commands)\b", msg):
        return ("**I can help you with:**\n\n"
                "- *What topics are in CS401?*\n"
                "- *Career scope of Web Development*\n"
                "- *Project ideas for Database Systems*\n"
                "- *Study tips for Machine Learning*\n"
                "- *Is Operating Systems hard?*\n"
                "- *Prerequisites for CS401*\n"
                "- *Recommend for data science*\n"
                "- *Show all courses*")

    codes = ", ".join([c["code"] for c in courses[:5]])
    return "I am not sure about that. Try asking about a specific course!\n\nAvailable: **" + codes + "**...\n\nType *help* to see what I can do."


@chat_bp.post("/chat")
@jwt_required()
def chat():
    d = request.get_json() or {}
    message = (d.get("message") or "").strip()
    if not message:
        return jsonify(error="Empty message"), 400
    courses = Course.all()
    reply = bot_reply(message, courses)
    return jsonify(reply=reply), 200
