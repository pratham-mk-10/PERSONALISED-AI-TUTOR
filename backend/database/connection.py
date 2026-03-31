import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="question_bank",
        user="postgres",
        password="your_password"
    )