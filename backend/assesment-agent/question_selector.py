from database.queries import fetch_questions, fetch_by_misconception

def get_initial_questions():
    return fetch_questions()

def get_targeted_questions(tag):
    return fetch_by_misconception(tag)