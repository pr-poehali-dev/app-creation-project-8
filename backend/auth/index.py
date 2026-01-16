import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для регистрации, входа и управления сессиями пользователей с защитой'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        
        if action == 'register':
            result = register_user(conn, body)
        elif action == 'login':
            result = login_user(conn, body, event)
        elif action == 'verify':
            result = verify_session(conn, body)
        elif action == 'logout':
            result = logout_user(conn, body)
        else:
            result = {'error': 'Invalid action'}
        
        conn.close()
        
        return {
            'statusCode': 200 if 'error' not in result else 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${pwd_hash.hex()}"


def verify_password(password: str, hash_string: str) -> bool:
    try:
        salt, pwd_hash = hash_string.split('$')
        new_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return new_hash.hex() == pwd_hash
    except:
        return False


def register_user(conn, body: dict) -> dict:
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    full_name = body.get('full_name', '').strip()
    
    if not email or not password:
        return {'error': 'Email и пароль обязательны'}
    
    if len(password) < 6:
        return {'error': 'Пароль должен быть минимум 6 символов'}
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        return {'error': 'Пользователь с таким email уже существует'}
    
    password_hash = hash_password(password)
    
    cursor.execute(
        "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id, email, full_name, created_at",
        (email, password_hash, full_name or None)
    )
    user = cursor.fetchone()
    conn.commit()
    cursor.close()
    
    return {
        'success': True,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'created_at': user['created_at'].isoformat()
        }
    }


def login_user(conn, body: dict, event: dict) -> dict:
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    if not email or not password:
        return {'error': 'Email и пароль обязательны'}
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute("SELECT * FROM users WHERE email = %s AND is_active = true", (email,))
    user = cursor.fetchone()
    
    if not user or not verify_password(password, user['password_hash']):
        cursor.close()
        return {'error': 'Неверный email или пароль'}
    
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=7)
    
    ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
    user_agent = event.get('headers', {}).get('user-agent', 'unknown')
    
    cursor.execute(
        "INSERT INTO sessions (user_id, session_token, expires_at, ip_address, user_agent) VALUES (%s, %s, %s, %s, %s)",
        (user['id'], session_token, expires_at, ip_address, user_agent)
    )
    
    cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user['id'],))
    
    conn.commit()
    cursor.close()
    
    return {
        'success': True,
        'token': session_token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'full_name': user['full_name']
        }
    }


def verify_session(conn, body: dict) -> dict:
    token = body.get('token', '')
    
    if not token:
        return {'error': 'Token required'}
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(
        "SELECT s.*, u.email, u.full_name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP",
        (token,)
    )
    session = cursor.fetchone()
    cursor.close()
    
    if not session:
        return {'error': 'Invalid or expired session'}
    
    return {
        'valid': True,
        'user': {
            'id': session['user_id'],
            'email': session['email'],
            'full_name': session['full_name']
        }
    }


def logout_user(conn, body: dict) -> dict:
    token = body.get('token', '')
    
    if not token:
        return {'error': 'Token required'}
    
    cursor = conn.cursor()
    cursor.execute("UPDATE sessions SET expires_at = CURRENT_TIMESTAMP WHERE session_token = %s", (token,))
    conn.commit()
    cursor.close()
    
    return {'success': True}
